import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, SetStateAction } from 'react';
import {
  AlertTriangle,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  ListPlus,
  Play,
  RefreshCw,
  RotateCw,
  Search,
  Shuffle,
  Trash2,
  XCircle,
} from 'lucide-react';
import type {
  EditableTrackTags,
  LibraryFolderNode,
  LibraryFolderOverview,
  LibraryPage,
  LibraryPlaylist,
  LibraryScanStatus,
  LibrarySort,
  LibraryTrack,
} from '../../shared/types/library';
import type {
  RemoteBackgroundJobStatus,
  RemoteDirectoryItem,
  RemoteDirectoryPreviewItem,
  RemoteIndexedFolderStats,
  RemoteSource,
  RemoteSyncStatus,
  RemoteTrackLookupItem,
} from '../../shared/types/remoteSources';
import { TrackContextMenu } from '../components/library/TrackContextMenu';
import type { TrackMenuAction } from '../components/library/TrackContextMenu';
import { OsuTimingPanel } from '../components/library/OsuTimingPanel';
import { TrackList } from '../components/library/TrackList';
import { TrackTagEditorDrawer } from '../components/library/TrackTagEditorDrawer';
import { StyledSelect } from '../components/ui/StyledSelect';
import { useRemoteCoverPreloader } from '../hooks/useRemoteCoverPreloader';
import {
  forgetLibraryScanStatus,
  getLibraryScanStatuses,
  rememberLibraryScanStatus,
  subscribeLibraryScanStatuses,
  type ScanStatusByFolder,
} from '../stores/libraryScanSession';
import { usePlaybackQueue } from '../stores/PlaybackQueueProvider';
import { useI18n } from '../i18n/I18nProvider';
import { resolvePlaylistForTrackAdd } from '../utils/appPrompt';
import { getAppBridge, getRemoteSourcesBridge } from '../utils/echoBridge';
import { useImeAwareDebouncedSearch } from '../utils/imeInput';
import type { TranslationKey } from '../i18n/locales';
import { openAlbumDetailForTrack } from '../utils/albumNavigation';
import { readStoredLibrarySort, writeStoredLibrarySort } from '../utils/librarySortMemory';
import { formatUserFacingError, getRawErrorMessage } from '../utils/userFacingError';

type FolderTarget = {
  folderId: string;
  path: string;
  name: string;
  rootName: string;
  rootPath: string;
  trackCount: number;
  childFolderCount: number;
  totalDuration: number;
  totalSizeBytes: number;
  coverThumbs: string[];
};

type TrackMenuState = {
  track: LibraryTrack;
  tracks: LibraryTrack[];
  position: { x: number; y: number };
};

type FolderMode = 'local' | 'import';

type RemoteFolderTarget = {
  sourceId: string;
  sourceName: string;
  provider: RemoteSource['provider'];
  path: string;
  name: string;
};

const pageSize = 100;
const bulkPageSize = 500;
const maxBulkTracks = 1000;
const terminalStatuses = new Set<LibraryScanStatus['status']>(['completed', 'failed', 'cancelled']);
const runningStatuses = new Set<LibraryScanStatus['status']>(['queued', 'running']);
const folderRootDragMime = 'application/x-echo-folder-root-id';
const folderRootOrderMemoryKey = 'echo-next.folder-root-order.v1';
const localFolderTreeViewMemoryKey = 'echo-next.local-folder-tree-view.v1';

const uniqueFolderRootIds = (ids: unknown): string[] => {
  if (!Array.isArray(ids)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of ids) {
    if (typeof id !== 'string' || !id || seen.has(id)) {
      continue;
    }

    seen.add(id);
    result.push(id);
  }

  return result;
};

const readFolderRootOrderMemory = (): string[] => {
  try {
    const raw = window.localStorage.getItem(folderRootOrderMemoryKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as { orderedIds?: unknown } | unknown[];
    return Array.isArray(parsed) ? uniqueFolderRootIds(parsed) : uniqueFolderRootIds(parsed.orderedIds);
  } catch {
    return [];
  }
};

const writeFolderRootOrderMemory = (orderedIds: string[]): void => {
  try {
    window.localStorage.setItem(
      folderRootOrderMemoryKey,
      JSON.stringify({
        version: 1,
        orderedIds: uniqueFolderRootIds(orderedIds),
      }),
    );
  } catch {
    // Folder order memory is a sidebar preference; folder data stays in the library database.
  }
};

type LocalFolderTreeViewMemory = {
  expanded: Record<string, boolean>;
  selectedKey: string | null;
};

const emptyLocalFolderTreeViewMemory = (): LocalFolderTreeViewMemory => ({
  expanded: {},
  selectedKey: null,
});

const normalizeFolderTreeExpandedMemory = (value: unknown): Record<string, boolean> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const expanded: Record<string, boolean> = {};
  for (const [key, isExpanded] of Object.entries(value as Record<string, unknown>)) {
    if (isExpanded === true && parseTargetKey(key)) {
      expanded[key] = true;
    }
  }

  return expanded;
};

const readLocalFolderTreeViewMemory = (): LocalFolderTreeViewMemory => {
  try {
    const raw = window.localStorage.getItem(localFolderTreeViewMemoryKey);
    if (!raw) {
      return emptyLocalFolderTreeViewMemory();
    }

    const parsed = JSON.parse(raw) as { expanded?: unknown; selectedKey?: unknown };
    const selectedKey = typeof parsed.selectedKey === 'string' && parseTargetKey(parsed.selectedKey)
      ? parsed.selectedKey
      : null;
    return {
      expanded: normalizeFolderTreeExpandedMemory(parsed.expanded),
      selectedKey,
    };
  } catch {
    return emptyLocalFolderTreeViewMemory();
  }
};

const writeLocalFolderTreeViewMemory = (
  expanded: Record<string, boolean>,
  selected: Pick<FolderTarget, 'folderId' | 'path'> | null,
): void => {
  try {
    window.localStorage.setItem(
      localFolderTreeViewMemoryKey,
      JSON.stringify({
        version: 1,
        expanded: normalizeFolderTreeExpandedMemory(expanded),
        selectedKey: selected ? targetKey(selected.folderId, selected.path) : null,
      }),
    );
  } catch {
    // Folder tree memory is a view preference and must not block library browsing.
  }
};

const orderFolderOverviews = (items: LibraryFolderOverview[], orderedIds: string[]): LibraryFolderOverview[] => {
  if (items.length <= 1 || orderedIds.length === 0) {
    return items;
  }

  const orderById = new Map(orderedIds.map((id, index) => [id, index] as const));
  return [...items].sort((left, right) => {
    const leftOrder = orderById.get(left.id);
    const rightOrder = orderById.get(right.id);
    if (leftOrder === undefined && rightOrder === undefined) {
      return 0;
    }
    if (leftOrder === undefined) {
      return 1;
    }
    if (rightOrder === undefined) {
      return -1;
    }
    return leftOrder - rightOrder;
  });
};

const moveFolderRootId = (items: LibraryFolderOverview[], sourceId: string, targetId: string): string[] | null => {
  const fromIndex = items.findIndex((item) => item.id === sourceId);
  const toIndex = items.findIndex((item) => item.id === targetId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return null;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  if (!movedItem) {
    return null;
  }

  nextItems.splice(Math.max(0, Math.min(toIndex, nextItems.length)), 0, movedItem);
  return nextItems.map((item) => item.id);
};

const remoteProviderLabels = {
  webdav: 'WebDAV / AList',
  baidu: '百度网盘',
  jellyfin: 'Jellyfin',
  emby: 'Emby',
  smb: 'NAS / SMB',
  sshfs: 'SSHFS',
  subsonic: 'Subsonic',
} satisfies Record<RemoteSource['provider'], string>;

const remoteStatusLabels = {
  enabled: '已启用',
  disabled: '已禁用',
  error: '异常',
} satisfies Record<RemoteSource['status'], string>;

const sortOptions: Array<{ value: LibrarySort; labelKey: TranslationKey }> = [
  { value: 'default', labelKey: 'folders.sort.title' },
  { value: 'createdAsc', labelKey: 'library.sort.createdAsc' },
  { value: 'createdDesc', labelKey: 'library.sort.createdDesc' },
  { value: 'artist', labelKey: 'folders.sort.artist' },
  { value: 'album', labelKey: 'folders.sort.album' },
  { value: 'fileModifiedAsc', labelKey: 'library.sort.fileModifiedAsc' },
  { value: 'fileModifiedDesc', labelKey: 'library.sort.fileModifiedDesc' },
  { value: 'recent', labelKey: 'folders.sort.recent' },
  { value: 'durationDesc', labelKey: 'folders.sort.duration' },
  { value: 'qualityDesc', labelKey: 'folders.sort.quality' },
  { value: 'random', labelKey: 'folders.sort.random' },
];
const foldersSortStorageKey = 'echo-next.folders.sort';
const validFolderSortValues = new Set<LibrarySort>(sortOptions.map((option) => option.value));

const remoteIndexedRefreshMinIntervalMs = 15_000;
const targetKey = (folderId: string, path: string): string => `${folderId}::${path}`;
const remoteTreeKey = (sourceId: string, path: string): string => `${sourceId}::${normalizeRemoteFolderPath(path)}`;

const parseTargetKey = (key: string): { folderId: string; path: string } | null => {
  const separatorIndex = key.indexOf('::');
  if (separatorIndex <= 0) {
    return null;
  }

  return {
    folderId: key.slice(0, separatorIndex),
    path: key.slice(separatorIndex + 2),
  };
};

let localFolderTreeSession: {
  childrenByParent: Record<string, LibraryFolderNode[]>;
  expanded: Record<string, boolean>;
} = {
  childrenByParent: {},
  expanded: {},
};

export const __resetFoldersPageSessionForTests = (): void => {
  localFolderTreeSession = {
    childrenByParent: {},
    expanded: {},
  };
};

const mergeTracksById = (tracks: LibraryTrack[], updates: LibraryTrack[]): LibraryTrack[] => {
  if (updates.length === 0) {
    return tracks;
  }

  const updatesById = new Map(updates.map((track) => [track.id, track]));
  return tracks.map((track) => updatesById.get(track.id) ?? track);
};

const trimLocalPathEnd = (value: string): string => value.replace(/[\\/]+$/u, '');

const normalizeLocalPathForCompare = (value: string): string => trimLocalPathEnd(value).replace(/\\/gu, '/').toLocaleLowerCase();

const isSameLocalPath = (left: string, right: string): boolean => normalizeLocalPathForCompare(left) === normalizeLocalPathForCompare(right);

const localParentPath = (rootPath: string, currentPath: string): string | null => {
  const trimmedCurrent = trimLocalPathEnd(currentPath);
  if (!trimmedCurrent || isSameLocalPath(rootPath, trimmedCurrent)) {
    return null;
  }

  const slashIndex = Math.max(trimmedCurrent.lastIndexOf('\\'), trimmedCurrent.lastIndexOf('/'));
  if (slashIndex <= 0) {
    return null;
  }

  const parent = trimmedCurrent.slice(0, slashIndex);
  return isSameLocalPath(rootPath, parent) ? rootPath : parent;
};

const localAncestorPaths = (rootPath: string, currentPath: string): string[] => {
  const paths: string[] = [];
  let parent = localParentPath(rootPath, currentPath);

  while (parent) {
    paths.push(parent);
    parent = localParentPath(rootPath, parent);
  }

  return paths.reverse();
};

const shouldIgnoreEscapeTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
};

const formatDuration = (seconds: number, t: (key: TranslationKey, options?: Record<string, string | number>) => string): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '--';
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return t('folders.duration.minutes', { count: minutes });
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? t('folders.duration.hoursMinutes', { hours, minutes: rest }) : t('folders.duration.hours', { count: hours });
};

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '--';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
};

const statusLabel = (status: LibraryScanStatus['status'], t: (key: TranslationKey) => string): string => {
  switch (status) {
    case 'queued':
      return t('folders.status.queued');
    case 'running':
      return t('folders.status.running');
    case 'completed':
      return t('folders.status.completed');
    case 'cancelled':
      return t('folders.status.cancelled');
    case 'failed':
      return t('folders.status.failed');
    default:
      return status;
  }
};

const phaseLabel = (phase: LibraryScanStatus['phase'], t: (key: TranslationKey) => string): string => {
  switch (phase) {
    case 'discovering':
      return t('folders.phase.discovering');
    case 'checking_cache':
      return t('folders.phase.checkingCache');
    case 'reading_metadata':
      return t('folders.phase.readingMetadata');
    case 'extracting_covers':
      return t('folders.phase.extractingCovers');
    case 'grouping_albums':
      return t('folders.phase.groupingAlbums');
    case 'writing_database':
      return t('folders.phase.writingDatabase');
    case 'finished':
      return t('folders.phase.finished');
    default:
      return phase;
  }
};

const formatFolderError = (error: unknown, t: (key: TranslationKey) => string): string => {
  const message = getRawErrorMessage(error);
  const upper = message.toUpperCase();

  if (upper.includes('ENOENT')) {
    return t('folders.error.pathMissing');
  }

  if (upper.includes('ENOTDIR')) {
    return t('folders.error.notFolder');
  }

  if (upper.includes('EACCES') || upper.includes('EPERM')) {
    return t('folders.error.permission');
  }

  return formatUserFacingError(error, { context: 'folders', fallback: t('folders.error.actionFailed') });
};

const overviewToTarget = (overview: LibraryFolderOverview): FolderTarget => ({
  folderId: overview.id,
  path: overview.path,
  name: overview.name,
  rootName: overview.name,
  rootPath: overview.path,
  trackCount: overview.trackCount,
  childFolderCount: overview.childFolderCount,
  totalDuration: overview.totalDuration,
  totalSizeBytes: overview.totalSizeBytes,
  coverThumbs: overview.coverThumbs,
});

const nodeToTarget = (node: LibraryFolderNode, root: LibraryFolderOverview): FolderTarget => ({
  folderId: node.folderId,
  path: node.path,
  name: node.name,
  rootName: root.name,
  rootPath: root.path,
  trackCount: node.trackCount,
  childFolderCount: node.childFolderCount,
  totalDuration: node.totalDuration,
  totalSizeBytes: node.totalSizeBytes,
  coverThumbs: node.coverThumbs,
});

const normalizeRemoteFolderPath = (value: string | null | undefined): string => {
  const trimmed = value?.trim().replace(/\\/gu, '/') ?? '';
  if (!trimmed || trimmed === '/') {
    return '/';
  }

  return `/${trimmed.replace(/^\/+/u, '').replace(/\/+$/u, '')}`;
};

const remoteRootPathForSource = (source: RemoteSource): string => {
  const rootPath = source.config.rootPath;
  return normalizeRemoteFolderPath(typeof rootPath === 'string' ? rootPath : '/');
};

const remoteTargetFromSource = (source: RemoteSource): RemoteFolderTarget => ({
  sourceId: source.id,
  sourceName: source.displayName,
  provider: source.provider,
  path: remoteRootPathForSource(source),
  name: source.displayName,
});

const remoteTargetFromItem = (source: RemoteSource, item: RemoteDirectoryItem): RemoteFolderTarget => ({
  sourceId: source.id,
  sourceName: source.displayName,
  provider: source.provider,
  path: normalizeRemoteFolderPath(item.path),
  name: item.name || item.path.split('/').filter(Boolean).at(-1) || source.displayName,
});

const remoteIndexedRootPath = (target: Pick<RemoteFolderTarget, 'provider' | 'path'>): string =>
  target.provider === 'subsonic' ? '/' : target.path;

const remoteParentPath = (source: RemoteSource, path: string): string | null => {
  const rootPath = remoteRootPathForSource(source);
  const currentPath = normalizeRemoteFolderPath(path);
  if (currentPath === rootPath) {
    return null;
  }

  const parent = normalizeRemoteFolderPath(currentPath.slice(0, currentPath.lastIndexOf('/')) || '/');
  return parent === rootPath ? rootPath : parent;
};

const remoteItemName = (item: RemoteDirectoryItem): string =>
  item.name || item.path.split('/').filter(Boolean).at(-1) || item.path;

const remoteTitleForAudioItem = (item: RemoteDirectoryItem): string =>
  remoteItemName(item).replace(/\.[^.]+$/u, '').replace(/[_-]+/gu, ' ').trim() || remoteItemName(item);

const remoteAudioFormatFor = (item: RemoteDirectoryItem): string => {
  const match = remoteItemName(item).match(/\.([a-z0-9]+)$/iu);
  return match?.[1]?.toUpperCase() ?? (item.contentType?.split('/').at(-1)?.toUpperCase() || 'AUDIO');
};

const remoteCredentialHintFor = (source: RemoteSource): string | null => {
  if (source.provider !== 'baidu') {
    return null;
  }

  if (source.config.credentialMode === 'oauth-refresh') {
    return 'OAuth 自动续期';
  }

  if (source.config.credentialMode === 'access-token') {
    return 'Access Token';
  }

  return null;
};

const remoteTrackFromItem = (
  source: RemoteSource,
  item: RemoteDirectoryItem,
  indexedTrack?: RemoteTrackLookupItem,
  previewTrack?: RemoteDirectoryPreviewItem,
): LibraryTrack => {
  if (indexedTrack) {
    return {
      id: indexedTrack.trackId,
      mediaType: 'remote',
      path: `remote://${source.id}${indexedTrack.remotePath}`,
      sourceId: source.id,
      sourceDisplayName: source.displayName,
      provider: source.provider,
      remotePath: indexedTrack.remotePath,
      stableKey: null,
      title: indexedTrack.title,
      artist: indexedTrack.artist,
      album: indexedTrack.album,
      albumArtist: indexedTrack.artist,
      trackNo: null,
      discNo: null,
      year: null,
      genre: null,
      duration: indexedTrack.duration ?? 0,
      codec: indexedTrack.codec,
      sampleRate: null,
      bitDepth: null,
      bitrate: null,
      coverId: null,
      coverThumb: indexedTrack.coverThumb,
      metadataStatus: indexedTrack.metadataStatus,
      embeddedMetadataStatus: 'pending',
      embeddedCoverStatus: indexedTrack.coverStatus === 'ok' ? 'present' : 'pending',
      fieldSources: {
        title: 'remote-index',
        artist: 'remote-index',
        album: 'remote-index',
      },
      unavailable: indexedTrack.availability === 'missing',
    };
  }

  const previewTitle = previewTrack?.title?.trim();
  const previewArtist = previewTrack?.artist?.trim();
  const previewAlbum = previewTrack?.album?.trim();
  const previewAlbumArtist = previewTrack?.albumArtist?.trim();

  return {
    id: `remote-browser:${source.id}:${item.path}`,
    mediaType: 'remote',
    isTemporary: true,
    path: `remote://${source.id}${item.path}`,
    sourceId: source.id,
    sourceDisplayName: source.displayName,
    provider: source.provider,
    remotePath: item.path,
    stableKey: `${source.id}:${item.path}:${item.etag ?? item.modifiedAt ?? item.sizeBytes ?? 'unknown'}`,
    title: previewTitle || remoteTitleForAudioItem(item),
    artist: previewArtist || 'Unknown Artist',
    album: previewAlbum || source.displayName,
    albumArtist: previewAlbumArtist || previewArtist || 'Unknown Artist',
    trackNo: previewTrack?.trackNo ?? null,
    discNo: previewTrack?.discNo ?? null,
    year: previewTrack?.year ?? null,
    genre: previewTrack?.genre ?? null,
    duration: previewTrack?.duration ?? 0,
    codec: previewTrack?.codec ?? remoteAudioFormatFor(item).toLowerCase(),
    sampleRate: previewTrack?.sampleRate ?? null,
    bitDepth: previewTrack?.bitDepth ?? null,
    bitrate: previewTrack?.bitrate ?? null,
    coverId: null,
    coverThumb: previewTrack?.coverThumb ?? null,
    metadataStatus: previewTrack?.metadataStatus ?? 'pending',
    embeddedMetadataStatus: previewTrack?.metadataStatus === 'ok' ? 'present' : 'pending',
    embeddedCoverStatus: previewTrack?.coverStatus === 'ok' ? 'present' : 'pending',
    fieldSources: {
      title: 'remote-browser',
      artist: 'remote-browser',
      album: 'remote-source',
      ...(previewTrack?.fieldSources ?? {}),
    },
  };
};

export const FoldersPage = (): JSX.Element => {
  const { t } = useI18n();
  const remoteApi = getRemoteSourcesBridge();
  const [mode, setMode] = useState<FolderMode>('local');
  const [overviews, setOverviews] = useState<LibraryFolderOverview[]>([]);
  const [folderRootOrderIds, setFolderRootOrderIds] = useState<string[]>(() => readFolderRootOrderMemory());
  const [childrenByParent, setChildrenByParentState] = useState<Record<string, LibraryFolderNode[]>>(
    () => localFolderTreeSession.childrenByParent,
  );
  const [expanded, setExpandedState] = useState<Record<string, boolean>>(() => ({
    ...readLocalFolderTreeViewMemory().expanded,
    ...localFolderTreeSession.expanded,
  }));
  const [loadingChildren, setLoadingChildren] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<FolderTarget | null>(null);
  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { search, searchInputProps } = useImeAwareDebouncedSearch(220);
  const [sort, setSort] = useState<LibrarySort>(() => readStoredLibrarySort(foldersSortStorageKey, validFolderSortValues));
  const localizedSortOptions = useMemo(
    () => sortOptions.map((option) => ({ value: option.value, label: t(option.labelKey) })),
    [t],
  );
  const [recursive, setRecursive] = useState(true);
  const [folderPath, setFolderPath] = useState('');
  const [scanStatuses, setScanStatuses] = useState<ScanStatusByFolder>(getLibraryScanStatuses);
  const [isLoadingOverviews, setIsLoadingOverviews] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackMenu, setTrackMenu] = useState<TrackMenuState | null>(null);
  const [osuTimingTrack, setOsuTimingTrack] = useState<LibraryTrack | null>(null);
  const [editingTrack, setEditingTrack] = useState<LibraryTrack | null>(null);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [tagEditorError, setTagEditorError] = useState<string | null>(null);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [draggedFolderRootId, setDraggedFolderRootId] = useState<string | null>(null);
  const draggedFolderRootIdRef = useRef<string | null>(null);
  const [dropTargetFolderRootId, setDropTargetFolderRootId] = useState<string | null>(null);
  const [remoteSources, setRemoteSources] = useState<RemoteSource[]>([]);
  const [selectedRemote, setSelectedRemote] = useState<RemoteFolderTarget | null>(null);
  const [remoteItems, setRemoteItems] = useState<RemoteDirectoryItem[]>([]);
  const [remoteCachedTracks, setRemoteCachedTracks] = useState<LibraryTrack[]>([]);
  const [remoteFolderStats, setRemoteFolderStats] = useState<RemoteIndexedFolderStats | null>(null);
  const [remotePage, setRemotePage] = useState(1);
  const [remoteHasMore, setRemoteHasMore] = useState(false);
  const [remoteIndexedTracks, setRemoteIndexedTracks] = useState<Record<string, RemoteTrackLookupItem>>({});
  const [remotePreviewTracks, setRemotePreviewTracks] = useState<Record<string, RemoteDirectoryPreviewItem>>({});
  const [remoteVisibleTrackIds, setRemoteVisibleTrackIds] = useState<string[]>([]);
  const [remoteDirectoryChildrenByParent, setRemoteDirectoryChildrenByParent] = useState<Record<string, RemoteDirectoryItem[]>>({});
  const [remoteExpanded, setRemoteExpanded] = useState<Record<string, boolean>>({});
  const [remoteLoadingChildren, setRemoteLoadingChildren] = useState<Record<string, boolean>>({});
  const [remoteSyncStatus, setRemoteSyncStatus] = useState<RemoteSyncStatus | null>(null);
  const [remoteJobStatus, setRemoteJobStatus] = useState<RemoteBackgroundJobStatus | null>(null);
  const [isLoadingRemoteSources, setIsLoadingRemoteSources] = useState(false);
  const [isLoadingRemoteDirectory, setIsLoadingRemoteDirectory] = useState(false);
  const [isLoadingRemoteTracks, setIsLoadingRemoteTracks] = useState(false);
  const [remoteLoadingTrackId, setRemoteLoadingTrackId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string | null> | null>(null);
  const trackRequestIdRef = useRef(0);
  const bulkRequestIdRef = useRef(0);
  const refreshedTerminalScanIdsRef = useRef<Set<string>>(new Set());
  const pendingLocalSelectionKeyRef = useRef<string | null>(readLocalFolderTreeViewMemory().selectedKey);
  const remoteIndexedRefreshRef = useRef<{ key: string | null; jobUpdatedAt: string | null; refreshedAt: number; syncStatus: RemoteSyncStatus['status'] | null }>({
    key: null,
    jobUpdatedAt: null,
    refreshedAt: 0,
    syncStatus: null,
  });
  const remoteVisibleHydrationInFlightRef = useRef<Set<string>>(new Set());
  const tagEditorCloseTimerRef = useRef<number | null>(null);
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const { currentTrackId, isShuffleEnabled, playTrack, appendToQueue, appendTracksToQueue, playTrackNext, removeTrackFromQueue, toggleShuffle } = usePlaybackQueue();
  const setChildrenByParent = useCallback((value: SetStateAction<Record<string, LibraryFolderNode[]>>): void => {
    setChildrenByParentState((current) => {
      const next = typeof value === 'function' ? value(current) : value;
      localFolderTreeSession.childrenByParent = next;
      return next;
    });
  }, []);
  const setExpanded = useCallback((value: SetStateAction<Record<string, boolean>>): void => {
    setExpandedState((current) => {
      const next = typeof value === 'function' ? value(current) : value;
      localFolderTreeSession.expanded = next;
      return next;
    });
  }, []);
  const orderedOverviews = useMemo(() => orderFolderOverviews(overviews, folderRootOrderIds), [folderRootOrderIds, overviews]);
  const canReorderFolderRoots = mode === 'local' && orderedOverviews.length > 1;

  const selectedOverview = useMemo(
    () => (selected ? orderedOverviews.find((overview) => overview.id === selected.folderId) ?? null : null),
    [orderedOverviews, selected],
  );
  const selectedScan = selected ? scanStatuses[selected.folderId] ?? selectedOverview?.recentScan ?? null : null;
  const isSelectedScanning = selectedScan ? runningStatuses.has(selectedScan.status) : false;
  const isSelectedRoot = Boolean(selected && selectedOverview && isSameLocalPath(selected.path, selectedOverview.path));
  const hasRunningLocalScan = mode === 'local' && Object.values(scanStatuses).some((status) => runningStatuses.has(status.status));
  const selectedRemoteSource = useMemo(
    () => remoteSources.find((source) => source.id === selectedRemote?.sourceId) ?? null,
    [remoteSources, selectedRemote],
  );
  const remoteSyncRunning = remoteSyncStatus?.status === 'running';
  const remoteJobPendingCount = remoteJobStatus
    ? Object.values(remoteJobStatus.pending).reduce((total, count) => total + count, 0)
    : 0;
  const remoteJobRunningCount = remoteJobStatus
    ? Object.values(remoteJobStatus.running).reduce((total, count) => total + count, 0)
    : 0;
  const remoteJobCompletedCount = remoteJobStatus
    ? Object.values(remoteJobStatus.completed).reduce((total, count) => total + count, 0)
    : 0;
  const remoteJobTotalCount = remoteJobPendingCount + remoteJobRunningCount + remoteJobCompletedCount + (
    remoteJobStatus ? Object.values(remoteJobStatus.failed).reduce((total, count) => total + count, 0) : 0
  );
  const remoteProgressTotal = Math.max(remoteSyncStatus?.discoveredCount ?? 0, remoteJobTotalCount, 1);
  const remoteProgressDone = remoteSyncRunning
    ? remoteSyncStatus?.writtenCount ?? 0
    : Math.min(remoteProgressTotal, remoteJobCompletedCount);
  const remoteProgressPercent = Math.max(0, Math.min(100, Math.round((remoteProgressDone / remoteProgressTotal) * 100)));
  const remoteBackgroundActive = remoteSyncRunning || remoteJobPendingCount > 0 || remoteJobRunningCount > 0;
  const remoteAudioItems = useMemo(() => remoteItems.filter((item) => item.audio), [remoteItems]);
  const remoteDirectoryItems = useMemo(() => remoteItems.filter((item) => item.kind === 'directory'), [remoteItems]);
  const remoteTracks = useMemo(() => {
    if (!selectedRemoteSource) {
      return [];
    }

    if (remoteCachedTracks.length > 0 || (remoteFolderStats?.trackCount ?? 0) > 0) {
      return remoteCachedTracks;
    }

    const normalizedSearch = search.toLocaleLowerCase();
    const sourceTracks = remoteAudioItems.map((item) => remoteTrackFromItem(selectedRemoteSource, item, remoteIndexedTracks[item.path], remotePreviewTracks[item.path]));
    const nextTracks = [...sourceTracks]
      .filter((track) =>
        !normalizedSearch ||
        track.title.toLocaleLowerCase().includes(normalizedSearch) ||
        track.artist.toLocaleLowerCase().includes(normalizedSearch) ||
        track.album.toLocaleLowerCase().includes(normalizedSearch) ||
        track.path.toLocaleLowerCase().includes(normalizedSearch),
      );

    if (sort === 'artist') {
      return nextTracks.sort((left, right) => `${left.artist}\u0000${left.title}`.localeCompare(`${right.artist}\u0000${right.title}`));
    }
    if (sort === 'album') {
      return nextTracks.sort((left, right) => `${left.album}\u0000${left.trackNo ?? 0}\u0000${left.title}`.localeCompare(`${right.album}\u0000${right.trackNo ?? 0}\u0000${right.title}`));
    }
    if (sort === 'qualityDesc') {
      return nextTracks.sort((left, right) => (right.bitrate ?? 0) - (left.bitrate ?? 0));
    }
    if (sort === 'random') {
      return [...nextTracks].sort(() => Math.random() - 0.5);
    }

    return nextTracks.sort((left, right) => left.title.localeCompare(right.title));
  }, [remoteAudioItems, remoteCachedTracks, remoteFolderStats, remoteIndexedTracks, remotePreviewTracks, search, selectedRemoteSource, sort]);
  const folderSource = useMemo(
    () =>
      selected
        ? {
            type: 'folder' as const,
            label: recursive ? t('folders.queueSource.recursive', { name: selected.name }) : selected.name,
            folderId: selected.folderId,
            path: selected.path,
            recursive,
            search: search || undefined,
            sort,
          }
        : null,
    [recursive, search, selected, sort, t],
  );
  const remoteSource = useMemo(
    () =>
      selectedRemote
        ? {
            type: 'manual' as const,
            label: `网盘：${selectedRemote.sourceName} / ${selectedRemote.path}`,
          }
        : null,
    [selectedRemote],
  );
  const activeTracks = mode === 'import' ? [] : tracks;
  const selectedTracks = useMemo(
    () => activeTracks.filter((track) => selectedTrackIds[track.id] === true && !track.unavailable),
    [activeTracks, selectedTrackIds],
  );

  useEffect(() => subscribeLibraryScanStatuses(setScanStatuses), []);

  useEffect(() => {
    setSelectedTrackIds({});
  }, [mode, recursive, search, selected?.folderId, selected?.path, selectedRemote?.sourceId, selectedRemote?.path, sort]);

  const loadSettings = useCallback(async (): Promise<void> => {
    const app = window.echo?.app;
    if (!app?.getSettings) {
      return;
    }
    try {
      const s = await app.getSettings();
      setSettings({
        lyricsSaveDir: s.lyricsSaveDir ?? null,
        coverSaveDir: s.coverSaveDir ?? null,
        artistImageSaveDir: s.artistImageSaveDir ?? null,
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const refreshOverviews = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;

    if (!library?.getFolderOverviews) {
      setOverviews([]);
      setSelected(null);
      setError(t('folders.error.desktopManage'));
      return;
    }

    setIsLoadingOverviews(true);
    setError(null);

    try {
      const nextOverviews = await library.getFolderOverviews();
      setOverviews(nextOverviews);
      const pendingSelectionKey = pendingLocalSelectionKeyRef.current;
      const pendingSelection = pendingSelectionKey ? parseTargetKey(pendingSelectionKey) : null;
      const pendingSelectionRoot = pendingSelection
        ? nextOverviews.find((overview) => overview.id === pendingSelection.folderId)
        : null;
      if (pendingSelection && pendingSelectionRoot && !isSameLocalPath(pendingSelectionRoot.path, pendingSelection.path)) {
        setExpanded((expandedCurrent) => {
          const nextExpanded = { ...expandedCurrent };
          for (const ancestorPath of localAncestorPaths(pendingSelectionRoot.path, pendingSelection.path)) {
            nextExpanded[targetKey(pendingSelectionRoot.id, ancestorPath)] = true;
          }
          return nextExpanded;
        });
      }
      setSelected((current) => {
        if (current && nextOverviews.some((overview) => overview.id === current.folderId)) {
          const root = nextOverviews.find((overview) => overview.id === current.folderId)!;
          return current.path === root.path ? overviewToTarget(root) : current;
        }

        if (pendingSelection) {
          if (!pendingSelectionRoot) {
            pendingLocalSelectionKeyRef.current = null;
          } else if (isSameLocalPath(pendingSelectionRoot.path, pendingSelection.path)) {
            pendingLocalSelectionKeyRef.current = null;
            return overviewToTarget(pendingSelectionRoot);
          }

          return null;
        }

        const orderedNextOverviews = orderFolderOverviews(nextOverviews, readFolderRootOrderMemory());
        return orderedNextOverviews[0] ? overviewToTarget(orderedNextOverviews[0]) : null;
      });
    } catch (refreshError) {
      setError(formatFolderError(refreshError, t));
    } finally {
      setIsLoadingOverviews(false);
    }
  }, []);

  useEffect(() => {
    void refreshOverviews();
  }, [refreshOverviews]);

  const loadRemoteSources = useCallback(async (): Promise<void> => {
    if (!remoteApi) {
      setRemoteSources([]);
      return;
    }

    setIsLoadingRemoteSources(true);
    setError(null);

    try {
      const sources = await remoteApi.list();
      setRemoteSources(sources);
      setSelectedRemote((current) => {
        if (current && sources.some((source) => source.id === current.sourceId)) {
          return current;
        }
        return sources[0] ? remoteTargetFromSource(sources[0]) : null;
      });
    } catch (remoteError) {
      setError(remoteError instanceof Error ? remoteError.message : '读取网盘来源失败。');
    } finally {
      setIsLoadingRemoteSources(false);
    }
  }, [mode, remoteApi]);

  

  const loadRemoteTrackPage = useCallback(
    async (target: RemoteFolderTarget | null, nextPage: number, loadMode: 'replace' | 'append'): Promise<LibraryPage<LibraryTrack> | null> => {
      if (!target || !remoteApi?.listIndexedTracksPage) {
        setRemoteCachedTracks([]);
        setRemotePage(1);
        setRemoteHasMore(false);
        return null;
      }

      const requestId = trackRequestIdRef.current + 1;
      trackRequestIdRef.current = requestId;
      setIsLoadingRemoteTracks(true);
      setError(null);

      try {
        const result = await remoteApi.listIndexedTracksPage(target.sourceId, {
          rootPath: remoteIndexedRootPath(target),
          page: nextPage,
          pageSize,
          search,
          sort,
        });

        if (trackRequestIdRef.current !== requestId) {
          return null;
        }

        setRemoteCachedTracks((current) => (loadMode === 'append' ? [...current, ...result.items] : result.items));
        setRemotePage(result.page);
        setRemoteHasMore(result.hasMore);
        return result;
      } catch (tracksError) {
        if (trackRequestIdRef.current === requestId) {
          setError(tracksError instanceof Error ? tracksError.message : '读取网盘索引失败。');
          setRemoteCachedTracks((current) => (loadMode === 'append' ? current : []));
          setRemotePage(1);
          setRemoteHasMore(false);
        }
        return null;
      } finally {
        if (trackRequestIdRef.current === requestId) {
          setIsLoadingRemoteTracks(false);
        }
      }
    },
    [remoteApi, search, sort],
  );

  const loadRemoteDirectory = useCallback(
    async (target: RemoteFolderTarget | null): Promise<void> => {
      if (!target || !remoteApi) {
        setRemoteItems([]);
        setRemoteCachedTracks([]);
        setRemoteFolderStats(null);
        setRemotePage(1);
        setRemoteHasMore(false);
        setRemoteIndexedTracks({});
        setRemotePreviewTracks({});
        return;
      }

      setIsLoadingRemoteDirectory(true);
      setError(null);

      try {
        const indexedRootPath = remoteIndexedRootPath(target);
        const [items, stats, pageResult] = await Promise.all([
          remoteApi.browse(target.sourceId, target.path).catch(() => []),
          remoteApi.getIndexedFolderStats
            ? remoteApi.getIndexedFolderStats(target.sourceId, indexedRootPath).catch(() => null)
            : Promise.resolve(null),
          remoteApi.listIndexedTracksPage
            ? remoteApi.listIndexedTracksPage(target.sourceId, { rootPath: indexedRootPath, page: 1, pageSize, search, sort }).catch(() => null)
            : Promise.resolve(null),
        ]);
        const cachedTracks = pageResult?.items ?? [];
        const indexedTotal = pageResult?.total ?? stats?.trackCount ?? 0;
        const audioPaths = indexedTotal === 0 ? items.filter((item) => item.audio).map((item) => item.path) : [];
        const indexed = audioPaths.length > 0 ? await remoteApi.lookupTracks(target.sourceId, audioPaths) : [];
        const indexedByPath = Object.fromEntries(indexed.map((item) => [item.remotePath, item]));
        const previewItems = indexedTotal === 0 ? items.filter((item) => item.audio && !indexedByPath[item.path]) : [];
        const previews = previewItems.length > 0 && remoteApi.previewDirectoryItems
          ? await remoteApi.previewDirectoryItems(target.sourceId, previewItems, { includeCover: true, limit: 12 }).catch(() => [])
          : [];
        setRemoteItems(items);
        setRemoteFolderStats(stats);
        setRemoteCachedTracks(cachedTracks);
        setRemotePage(pageResult?.page ?? 1);
        setRemoteHasMore(pageResult?.hasMore ?? false);
        setRemoteIndexedTracks(indexedByPath);
        setRemotePreviewTracks(Object.fromEntries(previews.map((item) => [item.remotePath, item])));
        setRemoteDirectoryChildrenByParent((current) => ({
          ...current,
          [remoteTreeKey(target.sourceId, target.path)]: items.filter((item) => item.kind === 'directory'),
        }));
      } catch (remoteError) {
        setRemoteItems([]);
        setRemoteCachedTracks([]);
        setRemoteFolderStats(null);
        setRemotePage(1);
        setRemoteHasMore(false);
        setRemoteIndexedTracks({});
        setRemotePreviewTracks({});
        setError(remoteError instanceof Error ? remoteError.message : '读取网盘目录失败。');
      } finally {
        setIsLoadingRemoteDirectory(false);
      }
    },
    [remoteApi, search, sort],
  );

  const loadRemoteChildren = useCallback(
    async (source: RemoteSource, path: string, force = false): Promise<void> => {
      if (!remoteApi) {
        return;
      }

      const normalizedPath = normalizeRemoteFolderPath(path);
      const key = remoteTreeKey(source.id, normalizedPath);
      if (!force && remoteDirectoryChildrenByParent[key]) {
        return;
      }

      setRemoteLoadingChildren((current) => ({ ...current, [key]: true }));
      setError(null);

      try {
        const items = await remoteApi.browse(source.id, normalizedPath);
        setRemoteDirectoryChildrenByParent((current) => ({
          ...current,
          [key]: items.filter((item) => item.kind === 'directory'),
        }));
      } catch (remoteError) {
        setError(remoteError instanceof Error ? remoteError.message : t('folders.error.actionFailed'));
      } finally {
        setRemoteLoadingChildren((current) => ({ ...current, [key]: false }));
      }
    },
    [remoteApi, remoteDirectoryChildrenByParent, t],
  );

  const loadChildren = useCallback(
    async (folderId: string, parentPath: string, force = false): Promise<void> => {
      const library = window.echo?.library;
      const key = targetKey(folderId, parentPath);

      if (!library?.getFolderChildren || (!force && childrenByParent[key])) {
        return;
      }

      setLoadingChildren((current) => ({ ...current, [key]: true }));
      setError(null);

      try {
        const children = await library.getFolderChildren({ folderId, parentPath });
        setChildrenByParent((current) => ({ ...current, [key]: children }));
      } catch (childrenError) {
        setError(formatFolderError(childrenError, t));
      } finally {
        setLoadingChildren((current) => ({ ...current, [key]: false }));
      }
    },
    [childrenByParent],
  );

  const toggleExpanded = useCallback(
    (folderId: string, path: string): void => {
      const key = targetKey(folderId, path);
      const willExpand = !expanded[key];
      setExpanded((current) => ({ ...current, [key]: willExpand }));

      if (willExpand) {
        void loadChildren(folderId, path);
      }
    },
    [expanded, loadChildren],
  );

  useEffect(() => {
    for (const [key, isExpanded] of Object.entries(expanded)) {
      if (!isExpanded || childrenByParent[key] || loadingChildren[key]) {
        continue;
      }

      const target = parseTargetKey(key);
      if (target) {
        void loadChildren(target.folderId, target.path);
      }
    }
  }, [childrenByParent, expanded, loadChildren, loadingChildren]);

  useEffect(() => {
    const pendingSelectionKey = pendingLocalSelectionKeyRef.current;
    if (!pendingSelectionKey || mode !== 'local') {
      return;
    }

    const pendingSelection = parseTargetKey(pendingSelectionKey);
    if (!pendingSelection) {
      pendingLocalSelectionKeyRef.current = null;
      return;
    }

    const root = overviews.find((overview) => overview.id === pendingSelection.folderId);
    if (!root) {
      return;
    }

    if (isSameLocalPath(root.path, pendingSelection.path)) {
      pendingLocalSelectionKeyRef.current = null;
      setSelected(overviewToTarget(root));
      return;
    }

    const restoredNode = Object.values(childrenByParent)
      .flat()
      .find((node) => node.folderId === pendingSelection.folderId && isSameLocalPath(node.path, pendingSelection.path));
    if (restoredNode) {
      pendingLocalSelectionKeyRef.current = null;
      setSelected(nodeToTarget(restoredNode, root));
      return;
    }

    const ancestorKeys = localAncestorPaths(root.path, pendingSelection.path).map((path) => targetKey(root.id, path));
    const ancestorsLoaded = ancestorKeys.every((key) => childrenByParent[key] || loadingChildren[key] === false);
    if (ancestorsLoaded) {
      pendingLocalSelectionKeyRef.current = null;
      setSelected(overviewToTarget(root));
    }
  }, [childrenByParent, loadingChildren, mode, overviews]);

  useEffect(() => {
    if (mode !== 'local' || (pendingLocalSelectionKeyRef.current && !selected)) {
      return;
    }

    writeLocalFolderTreeViewMemory(expanded, selected);
  }, [expanded, mode, selected]);

  const loadTracks = useCallback(
    async (nextPage: number, loadMode: 'replace' | 'append'): Promise<void> => {
      const library = window.echo?.library;
      const target = selected;

      if (mode === 'import') {
        setTracks([]);
        setPage(1);
        setHasMore(false);
        setIsLoadingTracks(false);
        return;
      }

      if (!target || !library?.getFolderTracks) {
        setTracks([]);
        setPage(1);
        setHasMore(false);
        return;
      }

      const requestId = trackRequestIdRef.current + 1;
      trackRequestIdRef.current = requestId;
      setIsLoadingTracks(true);
      setError(null);

      try {
        const result = await library.getFolderTracks({
          folderId: target.folderId,
          path: target.path,
          recursive,
          page: nextPage,
          pageSize,
          search,
          sort,
        });

        if (trackRequestIdRef.current !== requestId) {
          return;
        }

        setTracks((current) => (loadMode === 'append' ? [...current, ...result.items] : result.items));
        setPage(result.page);
        setHasMore(result.hasMore);
      } catch (tracksError) {
        if (trackRequestIdRef.current === requestId) {
          setError(formatFolderError(tracksError, t));
        }
      } finally {
        if (trackRequestIdRef.current === requestId) {
          setIsLoadingTracks(false);
        }
      }
    },
    [mode, recursive, search, selected, sort],
  );

  useEffect(() => {
    bulkRequestIdRef.current += 1;
    void loadTracks(1, 'replace');
  }, [loadTracks]);

  useEffect(() => {
    writeStoredLibrarySort(foldersSortStorageKey, sort);
  }, [sort]);

  useEffect(() => {
    const activeJobIds = Object.values(scanStatuses)
      .filter((status) => runningStatuses.has(status.status))
      .map((status) => status.id)
      .sort();

    if (activeJobIds.length === 0) {
      return undefined;
    }

    const pollActiveJobs = (): void => {
      const library = window.echo?.library;
      if (!library?.getScanStatus) {
        return;
      }

      for (const jobId of activeJobIds) {
        void library.getScanStatus(jobId).then((status) => rememberLibraryScanStatus(status));
      }
    };

    pollActiveJobs();
    const timer = window.setInterval(pollActiveJobs, 1000);
    return () => window.clearInterval(timer);
  }, [scanStatuses]);

  useEffect(() => {
    const terminalStatus = Object.values(scanStatuses).find(
      (status) => terminalStatuses.has(status.status) && !refreshedTerminalScanIdsRef.current.has(status.id),
    );

    if (terminalStatus) {
      refreshedTerminalScanIdsRef.current.add(terminalStatus.id);
      void refreshOverviews();
      void loadTracks(1, 'replace');
    }
  }, [refreshOverviews, scanStatuses, loadTracks]);

  const fetchBulkTracks = useCallback(
    async (sortMode: LibrarySort): Promise<{ items: LibraryTrack[]; total: number }> => {
      const library = window.echo?.library;
      const target = selected;

      if (mode === 'import') {
        return { items: [], total: 0 };
      }

      if (!target || !library?.getFolderTracks) {
        return { items: [], total: 0 };
      }

      const requestId = bulkRequestIdRef.current + 1;
      bulkRequestIdRef.current = requestId;
      const items: LibraryTrack[] = [];
      let nextPage = 1;
      let totalTracks = 0;
      let result: LibraryPage<LibraryTrack> | null = null;

      do {
        result = await library.getFolderTracks({
          folderId: target.folderId,
          path: target.path,
          recursive,
          page: nextPage,
          pageSize: bulkPageSize,
          search,
          sort: sortMode,
        });

        if (bulkRequestIdRef.current !== requestId) {
          return { items: [], total: 0 };
        }

        totalTracks = result.total;
        items.push(...result.items);
        nextPage += 1;
      } while (result.hasMore && items.length < maxBulkTracks);

      return { items: items.slice(0, maxBulkTracks), total: totalTracks };
    },
    [mode, recursive, remoteApi, remoteTracks, search, selected, selectedRemote],
  );

  const handleSelectAllTracks = useCallback(async (): Promise<void> => {
    if (mode === 'import' || !selected) {
      return;
    }

    const activeSelectableTracks = activeTracks.filter((track) => !track.unavailable);
    if (activeSelectableTracks.length > 0 && activeSelectableTracks.every((track) => selectedTrackIds[track.id] === true)) {
      setSelectedTrackIds({});
      return;
    }

    setIsBulkLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await fetchBulkTracks(sort);
      const selectableTracks = result.items.filter((track) => !track.unavailable);

      setTracks(result.items);
      setPage(Math.max(1, Math.ceil(result.items.length / pageSize)));
      setHasMore(result.total > result.items.length);

      setSelectedTrackIds(Object.fromEntries(selectableTracks.map((track) => [track.id, true])));
    } catch (selectError) {
      setError(formatFolderError(selectError, t));
    } finally {
      setIsBulkLoading(false);
    }
  }, [activeTracks, fetchBulkTracks, mode, selected, selectedTrackIds, sort, t]);

  useEffect(() => {
    const handleSelectAllKeyDown = (event: KeyboardEvent): void => {
      const isSelectAllShortcut = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLocaleLowerCase() === 'a';
      if (!isSelectAllShortcut || event.defaultPrevented || shouldIgnoreEscapeTarget(event.target)) {
        return;
      }

      if (trackMenu || osuTimingTrack || editingTrack || isTagEditorOpen || isBulkLoading) {
        return;
      }

      const hasFolderSelection = mode === 'import' ? false : Boolean(selected);
      if (!hasFolderSelection || activeTracks.length === 0) {
        return;
      }

      event.preventDefault();
      void handleSelectAllTracks();
    };

    window.addEventListener('keydown', handleSelectAllKeyDown);
    return () => window.removeEventListener('keydown', handleSelectAllKeyDown);
  }, [activeTracks.length, editingTrack, handleSelectAllTracks, isBulkLoading, isTagEditorOpen, mode, osuTimingTrack, selected, selectedRemote, trackMenu]);

  const runBulkAction = useCallback(
    async (action: 'play' | 'shuffle' | 'append'): Promise<void> => {
      const sortMode = action === 'shuffle' ? 'random' : sort === 'random' && action === 'play' ? 'default' : sort;
      const queueSource = folderSource
        ? { ...folderSource, search: search || undefined, sort: sortMode }
        : null;
      if (!queueSource || mode === 'import' || !selected) {
        return;
      }

      setIsBulkLoading(true);
      setError(null);
      setMessage(null);

      try {
        const result = await fetchBulkTracks(sortMode);
        if (result.items.length === 0) {
          setMessage(t('folders.message.noPlayableTracks'));
          return;
        }

        if (action === 'append') {
          appendTracksToQueue(result.items, queueSource);
        } else {
          if (isShuffleEnabled) {
            toggleShuffle();
          }
          await playTrack(result.items[0], {
            replaceQueueWith: result.items,
            source: queueSource,
          });
        }

        setMessage(
          result.total > result.items.length
            ? t('folders.message.loadedPartial', { loaded: result.items.length, total: result.total })
            : t(action === 'append' ? 'folders.message.queuedTracks' : 'folders.message.loadedTracks', { count: result.items.length }),
        );
      } catch (bulkError) {
        setError(formatFolderError(bulkError, t));
      } finally {
        setIsBulkLoading(false);
      }
    },
    [appendTracksToQueue, fetchBulkTracks, folderSource, isShuffleEnabled, mode, playTrack, search, selected, sort, t, toggleShuffle],
  );

  const handleChooseFolder = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;

    if (!library) {
      setError(t('folders.error.desktopImport'));
      return;
    }

    try {
      const chosenPath = await library.chooseFolder();
      if (!chosenPath) {
        return;
      }

      setFolderPath(chosenPath);
      const folder = await library.addFolder(chosenPath);
      rememberLibraryScanStatus(await library.scanFolder(folder.id));
      setMessage(t('folders.message.folderAddedScanStarted'));
      await refreshOverviews();
    } catch (chooseError) {
      setError(formatFolderError(chooseError, t));
    }
  }, [refreshOverviews, t]);

  const handleAddPath = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;
    const normalizedPath = folderPath.trim();

    if (!normalizedPath || !library) {
      return;
    }

    try {
      const folder = await library.addFolder(normalizedPath);
      rememberLibraryScanStatus(await library.scanFolder(folder.id));
      setMessage(t('folders.message.folderAddedScanStarted'));
      await refreshOverviews();
    } catch (addError) {
      setError(formatFolderError(addError, t));
    }
  }, [folderPath, refreshOverviews, t]);

  const handleScanSelected = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;
    if (!selected || !library?.scanFolder) {
      return;
    }

    const current = getLibraryScanStatuses()[selected.folderId];
    if (current && runningStatuses.has(current.status)) {
      setMessage(t('folders.message.alreadyScanning'));
      return;
    }

    try {
      rememberLibraryScanStatus(await library.scanFolder(selected.folderId));
      setMessage(t('folders.message.scanStarted'));
    } catch (scanError) {
      setError(formatFolderError(scanError, t));
    }
  }, [selected, t]);

  const handleScanSelectedChanges = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;
    if (!selected || !selectedOverview || !isSameLocalPath(selected.path, selectedOverview.path) || !library?.scanFolderChanges) {
      return;
    }

    const current = getLibraryScanStatuses()[selected.folderId];
    if (current && runningStatuses.has(current.status)) {
      setMessage(t('folders.message.alreadyScanning'));
      return;
    }

    try {
      rememberLibraryScanStatus(await library.scanFolderChanges(selectedOverview.id));
      setMessage(t('folders.message.incrementalScanStarted'));
    } catch (scanError) {
      setError(formatFolderError(scanError, t));
    }
  }, [selected, selectedOverview, t]);

  const handleRescanSelectedEmbeddedTags = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;
    if (!selected || !library?.rescanEmbeddedTags) {
      return;
    }

    const current = getLibraryScanStatuses()[selected.folderId];
    if (current && runningStatuses.has(current.status)) {
      setMessage(t('folders.message.alreadyScanning'));
      return;
    }

    try {
      const scans = await library.rescanEmbeddedTags('embedded-tags-all', {
        folderId: selected.folderId,
        path: selected.path,
        recursive,
      });
      if (scans[0]) {
        rememberLibraryScanStatus(scans[0]);
      }
      setMessage(t('folders.message.embeddedTagRescanStarted'));
    } catch (scanError) {
      setError(formatFolderError(scanError, t));
    }
  }, [recursive, selected, t]);

  const handleCancelScan = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;
    if (!selectedScan || !library?.cancelScan || !runningStatuses.has(selectedScan.status)) {
      return;
    }

    try {
      rememberLibraryScanStatus(await library.cancelScan(selectedScan.id));
      setMessage(t('folders.message.scanCancelled'));
    } catch (cancelError) {
      setError(formatFolderError(cancelError, t));
    }
  }, [selectedScan, t]);

  const handleRemoveRoot = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;
    if (!selected || !selectedOverview || !library?.removeFolder) {
      return;
    }

    if (!window.confirm(t('folders.confirm.removeRoot', { name: selectedOverview.name }))) {
      return;
    }

    try {
      await library.removeFolder(selectedOverview.id);
      forgetLibraryScanStatus(selectedOverview.id);
      setChildrenByParent({});
      setExpanded({});
      setSelected(null);
      setMessage(t('folders.message.folderRemoved'));
      await refreshOverviews();
      window.dispatchEvent(new Event('library:changed'));
    } catch (removeError) {
      setError(formatFolderError(removeError, t));
    }
  }, [refreshOverviews, selected, selectedOverview, t]);

  const handleOpenSelectedPath = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;
    if (!selected || !library?.openLibraryFolderPath) {
      return;
    }

    try {
      await library.openLibraryFolderPath({ folderId: selected.folderId, path: selected.path });
    } catch (openError) {
      setError(formatFolderError(openError, t));
    }
  }, [selected, t]);

  const handleLocalUp = useCallback(async (): Promise<boolean> => {
    const target = selected;
    const root = target ? overviews.find((overview) => overview.id === target.folderId) ?? null : null;
    if (!target || !root) {
      return false;
    }

    const parentPath = localParentPath(root.path, target.path);
    if (!parentPath) {
      return false;
    }

    if (isSameLocalPath(parentPath, root.path)) {
      setSelected(overviewToTarget(root));
      return true;
    }

    const cachedParent = Object.values(childrenByParent)
      .flat()
      .find((node) => node.folderId === target.folderId && isSameLocalPath(node.path, parentPath));
    if (cachedParent) {
      setSelected(nodeToTarget(cachedParent, root));
      return true;
    }

    const grandParentPath = localParentPath(root.path, parentPath) ?? root.path;
    const library = window.echo?.library;
    if (!library?.getFolderChildren) {
      return false;
    }

    try {
      const siblings = await library.getFolderChildren({ folderId: target.folderId, parentPath: grandParentPath });
      setChildrenByParent((current) => ({ ...current, [targetKey(target.folderId, grandParentPath)]: siblings }));
      const resolvedParent = siblings.find((node) => node.folderId === target.folderId && isSameLocalPath(node.path, parentPath));
      if (!resolvedParent) {
        return false;
      }

      setSelected(nodeToTarget(resolvedParent, root));
      return true;
    } catch (upError) {
      setError(formatFolderError(upError, t));
      return false;
    }
  }, [childrenByParent, overviews, selected, t]);

  const handleRemoteNavigate = useCallback((target: RemoteFolderTarget): void => {
    const parentPath = normalizeRemoteFolderPath(target.path).slice(0, normalizeRemoteFolderPath(target.path).lastIndexOf('/')) || '/';
    setRemoteExpanded((current) => ({
      ...current,
      [remoteTreeKey(target.sourceId, normalizeRemoteFolderPath(parentPath))]: true,
    }));
    setSelectedRemote(target);
    setMessage(null);
    setError(null);
  }, []);

  const toggleRemoteExpanded = useCallback(
    (source: RemoteSource, path: string): void => {
      const key = remoteTreeKey(source.id, path);
      const willExpand = !remoteExpanded[key];
      setRemoteExpanded((current) => ({ ...current, [key]: willExpand }));

      if (willExpand) {
        void loadRemoteChildren(source, path);
      }
    },
    [loadRemoteChildren, remoteExpanded],
  );

  const handleOpenRemoteSourceSettings = useCallback((): void => {
    window.dispatchEvent(new Event('app:navigate:settings'));
  }, []);

  const handleRemoteUp = useCallback((): void => {
    if (!selectedRemote || !selectedRemoteSource) {
      return;
    }

    const parent = remoteParentPath(selectedRemoteSource, selectedRemote.path);
    if (!parent) {
      return;
    }

    setSelectedRemote({
      ...selectedRemote,
      path: parent,
      name: parent === remoteRootPathForSource(selectedRemoteSource) ? selectedRemoteSource.displayName : parent.split('/').filter(Boolean).at(-1) ?? parent,
    });
  }, [selectedRemote, selectedRemoteSource]);

  const handleRemoteSync = useCallback(async (): Promise<void> => {
    if (!remoteApi || !selectedRemoteSource || !selectedRemote) {
      return;
    }

    try {
      const status = await remoteApi.sync(selectedRemoteSource.id, {
        rootPath: selectedRemote.path,
        includeCover: true,
        markMissing: false,
      });
      setRemoteSyncStatus(status);
      setMessage('网盘同步索引已开始；后台会按现有低负载策略执行。');
      void loadRemoteSources();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : '启动网盘同步失败。');
    }
  }, [loadRemoteSources, remoteApi, selectedRemote, selectedRemoteSource]);

  useEffect(() => {
    const handleEscapeNavigation = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || event.defaultPrevented || shouldIgnoreEscapeTarget(event.target)) {
        return;
      }

      if (!workbenchRef.current || workbenchRef.current.closest('[hidden]')) {
        return;
      }

      if (trackMenu || osuTimingTrack || editingTrack || isTagEditorOpen) {
        return;
      }

      if (mode === 'import' || !selected || !selectedOverview || !localParentPath(selectedOverview.path, selected.path)) {
        return;
      }

      event.preventDefault();
      void handleLocalUp();
    };

    window.addEventListener('keydown', handleEscapeNavigation);
    return () => window.removeEventListener('keydown', handleEscapeNavigation);
  }, [editingTrack, handleLocalUp, handleRemoteUp, isTagEditorOpen, mode, osuTimingTrack, selected, selectedOverview, selectedRemote, selectedRemoteSource, trackMenu]);

  const handleLoadMore = useCallback((): void => {
    if (mode === 'import') {
      return;
    }

    if (!isLoadingTracks && hasMore) {
      void loadTracks(page + 1, 'append');
    }
  }, [hasMore, isLoadingTracks, loadTracks, mode, page]);

  const hydrateRemoteMissingCovers = useCallback(
    (_trackIds: string[]): void => {},
    [],
  );

  useRemoteCoverPreloader({
    active: false,
    tracks: remoteTracks,
    visibleTrackIds: remoteVisibleTrackIds,
    hydrateMissingCovers: hydrateRemoteMissingCovers,
  });

  const handleVisibleRemoteTrackIdsChange = useCallback((trackIds: string[]): void => {
    setRemoteVisibleTrackIds(trackIds);
  }, []);

  const handlePlayTrack = useCallback(
    async (track: LibraryTrack): Promise<void> => {
      const queueSource = folderSource;
      if (!queueSource) {
        return;
      }

      try {
        setSelectedTrackIds({});
        await playTrack(track, {
          replaceQueueWith: activeTracks,
          source: queueSource,
        });
      } catch (playError) {
        setError(formatFolderError(playError, t));
      }
    },
    [activeTracks, folderSource, playTrack, t],
  );

  const handleToggleTrackSelected = useCallback((track: LibraryTrack): void => {
    if (track.unavailable) {
      return;
    }

    setSelectedTrackIds((current) => {
      const next = { ...current };
      if (next[track.id]) {
        delete next[track.id];
      } else {
        next[track.id] = true;
      }

      return next;
    });
  }, []);

  const handleOpenTrackMenu = useCallback((track: LibraryTrack, position: { x: number; y: number }): void => {
    const menuTracks = selectedTrackIds[track.id] && selectedTracks.length > 1 ? selectedTracks : [track];
    if (menuTracks.length === 1) {
      setSelectedTrackIds(track.unavailable ? {} : { [track.id]: true });
    }
    setTrackMenu({ track, tracks: menuTracks, position });
  }, [selectedTrackIds, selectedTracks]);

  const handleTrackMenuAction = useCallback(
    async (action: TrackMenuAction, track: LibraryTrack, playlistTarget?: LibraryPlaylist): Promise<void> => {
      const library = window.echo?.library;
      const actionTracks = trackMenu?.track.id === track.id ? trackMenu.tracks.filter((item) => !item.unavailable) : [track];
      setTrackMenu(null);

      if (action === 'clear-lyrics-cache') {
        const lyricsApi = window.echo?.lyrics;
        if (!lyricsApi?.clearCache) {
          setError('Desktop bridge unavailable. Open ECHO Next in Electron to clear lyrics cache.');
          return;
        }

        try {
          setError(null);
          setMessage(null);
          await Promise.all(actionTracks.map((item) => lyricsApi.clearCache(item.id)));
          window.dispatchEvent(new CustomEvent('lyrics:rematch-requested', { detail: { trackId: track.id } }));
          setMessage(`已清理歌词缓存：${track.title}`);
        } catch (actionError) {
          setError(formatFolderError(actionError, t));
        }
        return;
      }

      if (!library && action !== 'play-next' && action !== 'add-to-queue' && action !== 'remove-from-queue' && action !== 'edit-tags' && action !== 'reload-embedded-tags' && action !== 'open-osu-timing') {
        setError(t('folders.error.desktopFileActions'));
        return;
      }

      try {
        setError(null);
        setMessage(null);

        if (
          track.mediaType === 'remote' &&
          (action === 'edit-tags' ||
            action === 'reload-embedded-tags' ||
            action === 'open-osu-timing' ||
            action === 'show-in-folder' ||
            action === 'copy-path' ||
            action === 'open-system' ||
            action === 'delete-song')
        ) {
          setError('远程歌曲暂不支持本地文件操作。');
          return;
        }

        switch (action) {
          case 'play-next':
            {
              const queueSource = folderSource;
              if (queueSource) {
                actionTracks.forEach((item) => playTrackNext(item, queueSource));
              }
            }
            return;
          case 'add-to-queue':
            {
              const queueSource = folderSource;
              if (queueSource) {
                if (actionTracks.length > 1) {
                  appendTracksToQueue(actionTracks, queueSource);
                } else {
                  appendToQueue(track, queueSource);
                }
              }
            }
            return;
          case 'toggle-liked':
            await Promise.all(actionTracks.map((item) => library?.toggleTrackLiked(item.id)));
            window.dispatchEvent(new Event('liked:tracks-changed'));
            window.dispatchEvent(new Event('liked:changed'));
            return;
          case 'remove-from-queue':
            {
              const removedCount = actionTracks.reduce((total, item) => total + removeTrackFromQueue(item.id), 0);
              setMessage(
                removedCount > 0
                  ? `已从播放队列移除：${track.title}`
                  : `播放队列里没有这首歌：${track.title}`,
              );
            }
            return;
          case 'open-osu-timing':
            setOsuTimingTrack(track);
            return;
          case 'edit-tags':
            setTagEditorError(null);
            if (tagEditorCloseTimerRef.current !== null) {
              window.clearTimeout(tagEditorCloseTimerRef.current);
              tagEditorCloseTimerRef.current = null;
            }
            setIsTagEditorOpen(false);
            setEditingTrack(track);
            window.requestAnimationFrame(() => setIsTagEditorOpen(true));
            return;
          case 'reload-embedded-tags':
            {
              const result = await library!.loadEmbeddedTrackTags(track.id);
              setTracks((current) => current.map((item) => (item.id === result.track.id ? result.track : item)));
              if (editingTrack?.id === result.track.id) {
                setEditingTrack(result.track);
              }
              setMessage(`已从内嵌标签重新加载：${result.track.title}`);
              void refreshOverviews();
              window.dispatchEvent(new Event('library:changed'));
            }
            return;
          case 'go-to-album':
            if (!(await openAlbumDetailForTrack(track))) {
              setError(`Album not found: ${track.album || 'Unknown Album'}`);
            }
            return;
          case 'show-in-folder':
            await library?.openTrackInFolder(track.id);
            return;
          case 'copy-path':
            await library?.copyTrackPath(track.id);
            return;
          case 'open-system':
            await library?.openTrackWithSystem(track.id);
            return;
          case 'copy-name-artist':
            await library?.copyTrackNameArtist(track.id);
            return;
          case 'copy-cover':
            if (!(await library?.copyTrackCover(track.id))) {
              setError(t('folders.error.noCoverToCopy'));
            }
            return;
          case 'save-cover':
            if (!(await library?.saveTrackCover(track.id))) {
              setError(t('folders.error.noCoverSaved'));
            }
            return;
          case 'delete-song':
            if (!window.confirm(t('folders.confirm.deleteTrack', { title: track.title }))) {
              return;
            }
            await library?.deleteTrackFile(track.id);
            setTracks((current) => current.filter((item) => item.id !== track.id));
            void refreshOverviews();
            window.dispatchEvent(new Event('library:changed'));
            return;
          case 'add-to-playlist':
            {
              const playlistTracks = actionTracks.filter((item) => item.mediaType !== 'streaming');
              if (playlistTracks.length === 0) {
                setError('流媒体歌曲不能加入本地歌单，请在流媒体歌单中单独管理。');
                return;
              }

              const playlist = playlistTarget ?? (await resolvePlaylistForTrackAdd(library!));
              if (!playlist) {
                return;
              }

              if (playlistTracks.length > 1) {
                await library!.addTracksToPlaylist(playlist.id, playlistTracks.map((item) => item.id));
              } else {
                await Promise.all(playlistTracks.map((item) => library!.addTrackToPlaylist(playlist.id, item.id)));
              }
              window.dispatchEvent(new Event('library:playlists-changed'));
              setMessage(t('folders.message.addedToPlaylist', { name: playlist.name }));
            }
            return;
          default:
            setError(t('folders.error.trackActionUnavailable'));
        }
      } catch (actionError) {
        setError(formatFolderError(actionError, t));
      }
    },
    [appendToQueue, appendTracksToQueue, editingTrack, folderSource, mode, playTrackNext, refreshOverviews, remoteSource, removeTrackFromQueue, t, trackMenu],
  );

  const closeTagEditor = useCallback((): void => {
    setIsTagEditorOpen(false);
    if (tagEditorCloseTimerRef.current !== null) {
      window.clearTimeout(tagEditorCloseTimerRef.current);
    }
    tagEditorCloseTimerRef.current = window.setTimeout(() => {
      setEditingTrack(null);
      tagEditorCloseTimerRef.current = null;
    }, 280);
  }, []);

  const handleFolderRootDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>, overview: LibraryFolderOverview): void => {
      if (!canReorderFolderRoots) {
        event.preventDefault();
        return;
      }

      draggedFolderRootIdRef.current = overview.id;
      setDraggedFolderRootId(overview.id);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(folderRootDragMime, overview.id);
      event.dataTransfer.setData('text/plain', overview.id);
      console.log('[DRAG] start', overview.id, overview.name);
    },
    [canReorderFolderRoots],
  );

  const handleFolderRootDragOver = useCallback(
    (event: DragEvent<HTMLButtonElement>, overview: LibraryFolderOverview): void => {
      const draggedId = draggedFolderRootIdRef.current;
      if (!canReorderFolderRoots || !draggedId || draggedId === overview.id) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDropTargetFolderRootId((current) => (current === overview.id ? current : overview.id));
      console.log('[DRAG] over', overview.id, overview.name);
    },
    [canReorderFolderRoots],
  );

  const handleFolderRootDrop = useCallback(
    (event: DragEvent<HTMLButtonElement>, targetOverview: LibraryFolderOverview): void => {
      event.preventDefault();
      const sourceFolderId =
        draggedFolderRootIdRef.current ||
        event.dataTransfer.getData(folderRootDragMime) ||
        event.dataTransfer.getData('text/plain');

      console.log('[DRAG] drop', { sourceFolderId, targetId: targetOverview.id, targetName: targetOverview.name, ref: draggedFolderRootIdRef.current });

      draggedFolderRootIdRef.current = null;
      setDraggedFolderRootId(null);
      setDropTargetFolderRootId(null);

      if (!canReorderFolderRoots || !sourceFolderId || sourceFolderId === targetOverview.id) {
        console.log('[DRAG] drop skipped', { canReorderFolderRoots, sourceFolderId, sameTarget: sourceFolderId === targetOverview.id });
        return;
      }

      const nextOrderIds = moveFolderRootId(orderedOverviews, sourceFolderId, targetOverview.id);
      console.log('[DRAG] moveResult', nextOrderIds);
      if (!nextOrderIds) {
        return;
      }

      setFolderRootOrderIds(nextOrderIds);
      writeFolderRootOrderMemory(nextOrderIds);
      setError(null);
      setMessage('文件夹顺序已保存');
    },
    [canReorderFolderRoots, orderedOverviews],
  );

  const handleFolderRootDragEnd = useCallback((): void => {
    draggedFolderRootIdRef.current = null;
    setDraggedFolderRootId(null);
    setDropTargetFolderRootId(null);
  }, []);

  const handleSaveTags = useCallback(
    async (
      track: LibraryTrack,
      tags: EditableTrackTags,
      coverPath: string | null,
      coverUrl: string | null,
      coverMimeType: string | null,
    ): Promise<void> => {
      const library = window.echo?.library;

      if (!library?.updateTrackTags) {
        setTagEditorError(t('folders.error.desktopEditTags'));
        return;
      }

      setIsSavingTags(true);
      setTagEditorError(null);

      try {
        const updatedTrack = await library.updateTrackTags({ trackId: track.id, tags, coverPath, coverUrl, coverMimeType });
        setTracks((current) => current.map((item) => (item.id === updatedTrack.id ? updatedTrack : item)));
        window.dispatchEvent(new Event('library:changed'));
        closeTagEditor();
      } catch (saveError) {
        setTagEditorError(formatFolderError(saveError, t));
      } finally {
        setIsSavingTags(false);
      }
    },
    [closeTagEditor, t],
  );

  const renderChildNodes = (folderId: string, parentPath: string): JSX.Element | null => {
    const key = targetKey(folderId, parentPath);
    const children = childrenByParent[key] ?? [];
    const root = overviews.find((overview) => overview.id === folderId);

    if (!expanded[key]) {
      return null;
    }

    if (loadingChildren[key]) {
      return <div className="folder-tree-loading">{t('common.loading')}</div>;
    }

    if (!root || children.length === 0) {
      return null;
    }

    return (
      <div className="folder-tree-children">
        {children.map((node) => {
          const nodeKey = targetKey(node.folderId, node.path);
          const isSelected = selected?.folderId === node.folderId && selected.path === node.path;
          return (
            <div className="folder-tree-node-group" key={nodeKey}>
              <button
                className="folder-tree-node"
                data-active={isSelected}
                style={{ paddingLeft: 10 + node.depth * 14 }}
                type="button"
                onClick={() => setSelected(nodeToTarget(node, root))}
                onDoubleClick={() => {
                  if (node.childFolderCount > 0) {
                    toggleExpanded(node.folderId, node.path);
                  }
                }}
              >
                <span
                  className="folder-expand-hit"
                  data-hidden={node.childFolderCount === 0}
                  role="button"
                  tabIndex={-1}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleExpanded(node.folderId, node.path);
                  }}
                >
                  <ChevronRight size={14} data-open={expanded[nodeKey]} />
                </span>
                {expanded[nodeKey] ? <FolderOpen size={15} /> : <Folder size={15} />}
                <span>{node.name}</span>
                <em>{node.trackCount}</em>
              </button>
              {renderChildNodes(node.folderId, node.path)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderRemoteChildNodes = (source: RemoteSource, parentPath: string, depth = 0, visitedKeys = new Set<string>()): JSX.Element | null => {
    const normalizedParentPath = normalizeRemoteFolderPath(parentPath);
    const key = remoteTreeKey(source.id, normalizedParentPath);
    if (visitedKeys.has(key) || depth > 24) {
      return null;
    }

    const nextVisitedKeys = new Set(visitedKeys);
    nextVisitedKeys.add(key);
    const children = (
      remoteDirectoryChildrenByParent[key] ??
      (selectedRemote?.sourceId === source.id && normalizeRemoteFolderPath(selectedRemote.path) === normalizedParentPath
        ? remoteDirectoryItems.filter((item) => item.kind === 'directory')
        : [])
    ).filter((item) => {
      const itemPath = normalizeRemoteFolderPath(item.path);
      return itemPath !== normalizedParentPath && !nextVisitedKeys.has(remoteTreeKey(source.id, itemPath));
    });

    if (remoteLoadingChildren[key] && children.length === 0) {
      return <div className="folder-tree-loading">{t('common.loading')}</div>;
    }

    if (children.length === 0) {
      return null;
    }

    return (
      <div className="folder-tree-children">
        {children.map((item) => {
          const target = remoteTargetFromItem(source, item);
          const nodeKey = remoteTreeKey(source.id, target.path);
          const isSelected = selectedRemote?.sourceId === source.id && normalizeRemoteFolderPath(selectedRemote.path) === target.path;
          return (
            <div className="folder-tree-node-group" key={nodeKey}>
              <button
                className="folder-tree-node"
                data-active={isSelected}
                style={{ paddingLeft: 10 + depth * 14 }}
                type="button"
                onClick={() => handleRemoteNavigate(target)}
                onDoubleClick={() => toggleRemoteExpanded(source, target.path)}
              >
                <span
                  className="folder-expand-hit"
                  role="button"
                  tabIndex={-1}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleRemoteExpanded(source, target.path);
                  }}
                >
                  <ChevronRight size={14} data-open={remoteExpanded[nodeKey]} />
                </span>
                {remoteExpanded[nodeKey] || isSelected ? <FolderOpen size={15} /> : <Folder size={15} />}
                <span>{target.name}</span>
                <em>{item.modifiedAt ? new Date(item.modifiedAt).toLocaleDateString() : ''}</em>
              </button>
              {remoteExpanded[nodeKey] ? renderRemoteChildNodes(source, target.path, depth + 1, nextVisitedKeys) : null}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="folders-workbench" data-mode={mode} ref={workbenchRef}>
      <aside className="folders-sidebar">
        <div className="folders-pane-header">
          <div>
            <span className="panel-kicker">{mode === 'import' ? '导入' : t('folders.sidebar.kicker')}</span>
            <h1>{t('folders.sidebar.title')}</h1>
          </div>
          <div className="folders-header-tools">
            <div className="folder-source-switch" role="tablist" aria-label="文件夹来源">
              <button type="button" className={mode === 'local' ? 'active' : ''} onClick={() => setMode('local')}>本地</button>
              <button type="button" className={mode === 'import' ? 'active' : ''} onClick={() => setMode('import')}>导入</button>
            </div>
            <button
              className="tool-button"
              type="button"
              aria-label={t('folders.action.refresh')}
              title={t('folders.action.refresh')}
              onClick={() => void refreshOverviews()}
            >
              <RefreshCw className={isLoadingOverviews || isLoadingRemoteSources ? 'spinning-icon' : undefined} size={17} />
            </button>
          </div>
        </div>

        {hasRunningLocalScan ? (
          <div className="folders-scan-warning" role="status">
            <AlertTriangle size={15} />
            <span>{t('folders.scan.unresponsiveWarning')}</span>
          </div>
        ) : null}

        <div className="folders-root-list">
          {overviews.length === 0 ? (
            <p className="folders-empty">{t('folders.empty.roots')}</p>
          ) : (
            orderedOverviews.map((overview) => {
              const rootKey = targetKey(overview.id, overview.path);
              const isSelected = selected?.folderId === overview.id && selected.path === overview.path;
              const scan = scanStatuses[overview.id] ?? overview.recentScan;
              return (
                <div className="folder-root-group" key={overview.id}>
                  <button
                    className="folder-root-button"
                    data-active={isSelected}
                    data-dragging={draggedFolderRootId === overview.id ? 'true' : undefined}
                    data-drop-target={dropTargetFolderRootId === overview.id ? 'true' : undefined}
                    data-reorderable={canReorderFolderRoots ? 'true' : undefined}
                    draggable={canReorderFolderRoots}
                    type="button"
                    onDragEnd={handleFolderRootDragEnd}
                    onDragOver={(event) => handleFolderRootDragOver(event, overview)}
                    onDragStart={(event) => handleFolderRootDragStart(event, overview)}
                    onDrop={(event) => handleFolderRootDrop(event, overview)}
                    onClick={() => setSelected(overviewToTarget(overview))}
                    onDoubleClick={() => {
                      if (overview.childFolderCount > 0) {
                        toggleExpanded(overview.id, overview.path);
                      }
                    }}
                  >
                    {canReorderFolderRoots ? <GripVertical className="folder-root-drag-handle" size={15} aria-hidden="true" /> : null}
                    <span
                      className="folder-expand-hit"
                      data-hidden={overview.childFolderCount === 0}
                      role="button"
                      tabIndex={-1}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleExpanded(overview.id, overview.path);
                      }}
                    >
                      <ChevronRight size={15} data-open={expanded[rootKey]} />
                    </span>
                    <FolderOpen size={17} />
                    <span>
                      <strong>{overview.name}</strong>
                      <small>{scan ? statusLabel(scan.status, t) : t('folders.count.tracks', { count: overview.trackCount })}</small>
                    </span>
                    <em data-hidden={overview.trackCount === 0}>{overview.trackCount}</em>
                  </button>
                  {renderChildNodes(overview.id, overview.path)}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {mode === 'import' ? (
        <div className="folders-actions-panel">
          <div className="folders-import-top-row">
            <section>
              <div className="folders-panel-heading">
                <h2>导入</h2>
              </div>
              <div className="folder-action-grid" style={{ gridTemplateColumns: '1fr' }}>
                <button type="button" onClick={() => void handleChooseFolder()}>
                  <FolderPlus size={15} />
                  导入文件夹
                </button>
              </div>
            </section>

            <section>
              <div className="folders-panel-heading">
                <h2>管理</h2>
              </div>
              <div className="folder-action-grid">
                <button type="button" disabled={!selected} onClick={() => void handleOpenSelectedPath()}>
                  <FolderOpen size={15} />
                  打开文件夹
                </button>
                <button type="button" className="danger" disabled={!selected} onClick={() => void handleRemoveRoot()}>
                  <Trash2 size={15} />
                  移除文件夹
                </button>
              </div>
            </section>
          </div>

          <section>
            <div className="folders-panel-heading">
              <h2>扫描</h2>
            </div>
            <div className="folder-action-grid">
              <button type="button" disabled={!selected || isSelectedScanning} onClick={() => void handleScanSelected()}>
                <RefreshCw size={15} />
                全量扫描
              </button>
              <button type="button" disabled={!isSelectedRoot || isSelectedScanning} onClick={() => void handleScanSelectedChanges()}>
                <RotateCw size={15} />
                增量扫描
              </button>
              <button type="button" disabled={!selected || isSelectedScanning} onClick={() => void handleRescanSelectedEmbeddedTags()}>
                <RefreshCw size={15} />
                重新读取标签
              </button>
              <button type="button" disabled={!isSelectedScanning} onClick={() => void handleCancelScan()}>
                <XCircle size={15} />
                取消扫描
              </button>
            </div>
            {selectedScan ? (
              <div className="folder-scan-card" data-running={runningStatuses.has(selectedScan.status)}>
                <strong>{statusLabel(selectedScan.status, t)}</strong>
                <p>{phaseLabel(selectedScan.phase, t)}</p>
              </div>
            ) : null}
          </section>

          {error || message ? (
            <div className="folders-status-line">
              <span>{error ?? message}</span>
            </div>
          ) : null}
        </div>
      ) : (
        <main className="folders-main">
          <header className="folder-detail-header">
            <div className="folder-cover-stack" data-cover-count={Math.min(selected?.coverThumbs.length ?? 0, 4)} aria-hidden="true">
              {(selected?.coverThumbs ?? []).slice(0, 4).map((cover, index) => (
                <img alt="" key={cover} src={cover} style={{ '--cover-index': index } as CSSProperties} />
              ))}
              {selected?.coverThumbs.length ? null : <FolderOpen size={34} />}
            </div>
            <div className="folder-detail-title">
              <span>
                {selected
                  ? `${selected.rootName} / ${selected.path === selected.rootPath ? t('folders.detail.root') : t('folders.detail.subfolder')}`
                  : t('folders.detail.libraryFolders')}
              </span>
              <h2>{selected?.name ?? t('folders.detail.selectFolder')}</h2>
              <p>{selected?.path ?? t('folders.detail.importHint')}</p>
            </div>
            <div className="folder-detail-actions">
              <button className="primary-action" type="button" disabled={!selected || selected.trackCount === 0 || isBulkLoading} onClick={() => void runBulkAction('play')}>
                <Play size={16} fill="currentColor" />
                {t('folders.action.play')}
              </button>
              <button className="secondary-action" type="button" disabled={!selected || selected.trackCount === 0 || isBulkLoading} onClick={() => void runBulkAction('shuffle')}>
                <Shuffle size={16} />
                {t('folders.action.random')}
              </button>
              <button className="secondary-action" type="button" disabled={!selected || selected.trackCount === 0 || isBulkLoading} onClick={() => void runBulkAction('append')}>
                <ListPlus size={16} />
                {t('folders.action.queue')}
              </button>
            </div>
          </header>

          <section className="folder-metrics" aria-label={t('folders.metrics.label')}>
            <span>
              <strong>{selected?.trackCount ?? 0}</strong>
              {t('folders.metrics.tracks')}
            </span>
            <span>
              <strong>{formatDuration(selected?.totalDuration ?? 0, t)}</strong>
              {t('folders.metrics.duration')}
            </span>
            <span>
              <strong>{formatBytes(selected?.totalSizeBytes ?? 0)}</strong>
              {t('folders.metrics.size')}
            </span>
            <span>
              <strong>{selected?.childFolderCount ?? 0}</strong>
              {t('folders.metrics.subfolders')}
            </span>
          </section>

          <section className="folder-track-toolbar" aria-label={t('folders.filters.label')}>
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input type="search" placeholder={t('folders.filters.searchPlaceholder')} {...searchInputProps} />
            </label>
            <label className="folder-toggle">
              <input type="checkbox" checked={recursive} onChange={(event) => setRecursive(event.target.checked)} />
              <span>{t('folders.filters.includeSubfolders')}</span>
            </label>
            <StyledSelect
              className="folder-sort-control"
              value={sort}
              options={localizedSortOptions}
              onChange={setSort}
              ariaLabel={t('folders.filters.label')}
            />
          </section>

          <TrackList
            tracks={activeTracks}
            currentTrackId={currentTrackId}
            canLoadMore={hasMore && !isLoadingTracks}
            isLoadingMore={isLoadingTracks}
            selectedTrackIds={selectedTrackIds}
            onToggleSelected={handleToggleTrackSelected}
            onEndReached={handleLoadMore}
            onOpenTrackMenu={handleOpenTrackMenu}
            onPlay={(track) => void handlePlayTrack(track)}
          />

          {error || message || isLoadingTracks || isBulkLoading ? (
            <div className="folders-status-line">
              <span>{error ?? message ?? (isBulkLoading ? t('folders.statusLine.preparingQueue') : t('folders.statusLine.loadingTracks'))}</span>
            </div>
          ) : null}
        </main>
      )}



      {trackMenu ? (
        <TrackContextMenu
          track={trackMenu.track}
          position={trackMenu.position}
          selectionCount={trackMenu.tracks.length}
          onAction={(action, track, playlist) => void handleTrackMenuAction(action, track, playlist)}
          onClose={() => setTrackMenu(null)}
        />
      ) : null}

      <TrackTagEditorDrawer
        track={editingTrack}
        isOpen={isTagEditorOpen}
        isSaving={isSavingTags}
        error={tagEditorError}
        onClose={closeTagEditor}
        onSave={(track, tags, coverPath, coverUrl, coverMimeType) => void handleSaveTags(track, tags, coverPath, coverUrl, coverMimeType)}
        onTrackUpdated={(updatedTrack) => {
          setEditingTrack(updatedTrack);
          setTracks((current) => current.map((item) => (item.id === updatedTrack.id ? updatedTrack : item)));
          window.dispatchEvent(new Event('library:changed'));
        }}
      />

      <OsuTimingPanel
        track={osuTimingTrack}
        isOpen={Boolean(osuTimingTrack)}
        onClose={() => setOsuTimingTrack(null)}
        onTrackUpdated={(updatedTrack) => {
          setOsuTimingTrack(updatedTrack);
          setTracks((current) => current.map((item) => (item.id === updatedTrack.id ? updatedTrack : item)));
        }}
      />
    </div>
  );
};
