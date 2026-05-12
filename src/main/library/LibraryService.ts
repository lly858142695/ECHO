import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import electron from 'electron';
import { applyTagsToFile } from 'taglib-wasm';
import { createDatabase } from '../database/createDatabase';
import { AlbumService } from './AlbumService';
import { LibraryStore } from './LibraryStore';
import { inflateMetadataResult } from './MetadataService';
import { ScanJobQueue } from './ScanJobQueue';
import { NetworkMetadataService, type NetworkCandidateList, type NetworkRepairResult } from './network/NetworkMetadataService';
import type { MetadataService } from './MetadataService';
import type {
  LibraryAlbum,
  LibraryArtist,
  LibraryDiagnostics,
  EditableTrackTags,
  LibraryFolder,
  LibraryPage,
  LibraryPageQuery,
  LibraryScanStatus,
  LibrarySummary,
  LibraryTrack,
  LibraryCleanupResult,
  LibraryTrackTagUpdateRequest,
  CoverVariant,
} from './libraryTypes';
import type { MissingMetadataScanResult, NetworkApplyResult } from '../../shared/types/library';
import type { AppSettings } from '../../shared/types/appSettings';
import type { CoverExtractor } from './workers/CoverExtractor';
import type { FileScanner } from './workers/FileScanner';
import type { MetadataReader } from './workers/MetadataReader';
import { TsCoverExtractor } from './workers/TsCoverExtractor';
import { TsFileScanner } from './workers/TsFileScanner';
import { TsMetadataReader } from './workers/TsMetadataReader';

type LibraryServiceDependencies = {
  fileScanner?: FileScanner;
  metadataReader?: MetadataReader;
  coverExtractor?: CoverExtractor;
  metadataService?: MetadataService;
  coverCacheDir?: string;
  metadataConcurrency?: number;
  coverConcurrency?: number;
};

export class LibraryService {
  constructor(
    private readonly store: LibraryStore,
    private readonly scanJobQueue: ScanJobQueue,
    private readonly albumService: AlbumService,
    private readonly closeDatabase: () => void,
    private readonly databasePath: string | null = null,
    private readonly coverCacheDir: string | null = null,
    private readonly networkMetadataService: NetworkMetadataService | null = null,
  ) {}

  addFolder(folderPath: string): LibraryFolder {
    const normalizedPath = resolve(folderPath);
    const pathStat = statSync(normalizedPath);

    if (!pathStat.isDirectory()) {
      throw new Error(`Library folder path is not a directory: ${normalizedPath}`);
    }

    return this.store.addFolder(normalizedPath);
  }

  getFolders(): LibraryFolder[] {
    return this.store.getFolders();
  }

  removeFolder(folderId: string): void {
    this.store.removeFolder(folderId);
  }

  scanFolder(folderId: string): LibraryScanStatus {
    const folder = this.store.getFolder(folderId);

    if (!folder) {
      throw new Error(`Unknown library folder ${folderId}`);
    }

    return this.scanJobQueue.scanFolder(folder);
  }

  getScanStatus(jobId: string): LibraryScanStatus {
    return this.scanJobQueue.getScanStatus(jobId);
  }

  cancelScan(jobId: string): LibraryScanStatus {
    return this.scanJobQueue.cancelScan(jobId);
  }

  getTracks(query?: LibraryPageQuery): LibraryPage<LibraryTrack> {
    return this.store.getTracks(query);
  }

  getAlbums(query?: LibraryPageQuery): LibraryPage<LibraryAlbum> {
    return this.store.getAlbums(query);
  }

  getArtists(query?: LibraryPageQuery): LibraryPage<LibraryArtist> {
    return this.store.getArtists(query);
  }

  getAlbumTracks(albumId: string, query?: Pick<LibraryPageQuery, 'page' | 'pageSize'>): LibraryPage<LibraryTrack> {
    return this.store.getAlbumTracks(albumId, query);
  }

  getSummary(): LibrarySummary {
    return this.store.getSummary();
  }

  getDiagnostics(): LibraryDiagnostics {
    return this.store.getDiagnostics({
      databasePath: this.databasePath,
      databaseSizeBytes: this.databasePath ? pathSize(this.databasePath) : null,
      coverCachePath: this.coverCacheDir,
      coverCacheSizeBytes: this.coverCacheDir ? directorySize(this.coverCacheDir) : null,
    });
  }

  resolveCoverAsset(coverId: string, variant: CoverVariant): { filePath: string; mimeType: string | null } | null {
    return this.store.resolveCoverAsset(coverId, variant);
  }

  getTrack(trackId: string): LibraryTrack | null {
    return this.store.getTrack(trackId);
  }

  recordTrackPlayback(trackId: string): void {
    this.store.recordTrackPlayback(trackId);
  }

  async updateTrackTags(request: LibraryTrackTagUpdateRequest): Promise<LibraryTrack> {
    const currentTrack = this.store.getTrack(request.trackId);

    if (!currentTrack) {
      throw new Error(`Unknown track ${request.trackId}`);
    }

    if (!existsSync(currentTrack.path)) {
      throw new Error(`Track file is missing: ${currentTrack.path}`);
    }

    const tags = normalizeEditableTags(request.tags, currentTrack);

    await applyTagsToFile(currentTrack.path, {
      title: tags.title,
      artist: tags.artist,
      album: tags.album,
      albumArtist: tags.albumArtist,
      track: tags.trackNo ?? 0,
      discNumber: tags.discNo ?? 0,
      year: tags.year ?? 0,
      genre: tags.genre ?? '',
    });

    const fileStat = statSync(currentTrack.path);
    const fieldSources = {
      ...currentTrack.fieldSources,
      title: 'manual',
      artist: 'manual',
      album: 'manual',
      albumArtist: 'manual',
      trackNo: 'manual',
      discNo: 'manual',
      year: 'manual',
      genre: 'manual',
    };

    return this.store.transaction(() => {
      const updated = this.store.updateTrackTags(request.trackId, {
        ...tags,
        sizeBytes: fileStat.size,
        mtimeMs: fileStat.mtimeMs,
        fieldSources,
      });
      this.store.refreshAlbums(this.albumService);
      this.store.refreshArtists();
      return updated;
    });
  }

  async repairMissingMetadata(trackId: string, providerNames?: AppSettings['networkMetadataProviders']): Promise<NetworkRepairResult> {
    if (!this.networkMetadataService) {
      throw new Error('Network metadata service is unavailable');
    }

    return this.networkMetadataService.repairMissingMetadata(trackId, providerNames);
  }

  async scanMissingMetadata(limit: number, providerNames?: AppSettings['networkMetadataProviders']): Promise<MissingMetadataScanResult> {
    if (!this.networkMetadataService) {
      throw new Error('Network metadata service is unavailable');
    }

    return this.networkMetadataService.scanMissingMetadata(limit, providerNames);
  }

  showNetworkCandidates(trackId: string): NetworkCandidateList {
    if (!this.networkMetadataService) {
      throw new Error('Network metadata service is unavailable');
    }

    return this.networkMetadataService.showCandidates(trackId);
  }

  applyNetworkMissingOnly(candidateId: string): NetworkApplyResult {
    if (!this.networkMetadataService) {
      throw new Error('Network metadata service is unavailable');
    }

    return this.networkMetadataService.applyMissingOnly(candidateId);
  }

  applyNetworkSelected(candidateId: string): NetworkApplyResult {
    if (!this.networkMetadataService) {
      throw new Error('Network metadata service is unavailable');
    }

    return this.networkMetadataService.applySelected(candidateId);
  }

  rejectNetworkCandidate(candidateId: string): NetworkApplyResult {
    if (!this.networkMetadataService) {
      throw new Error('Network metadata service is unavailable');
    }

    return this.networkMetadataService.reject(candidateId);
  }

  deleteTrack(trackId: string): void {
    this.store.transaction(() => {
      this.store.deleteTrack(trackId);
      this.store.refreshAlbums(this.albumService);
      this.store.refreshArtists();
    });
  }

  pruneMissingTracks(): LibraryCleanupResult {
    const tracks = this.store.getActiveTracks();
    const missingTrackIds = tracks.filter((track) => !existsSync(track.path)).map((track) => track.id);

    const removedCount = this.store.transaction(() => {
      const changed = this.store.deleteTracks(missingTrackIds);
      if (changed > 0) {
        this.store.refreshAlbums(this.albumService);
        this.store.refreshArtists();
      }
      return changed;
    });

    return {
      scannedCount: tracks.length,
      removedCount,
    };
  }

  clearTracks(): LibraryCleanupResult {
    const scannedCount = this.store.getTracks({ pageSize: 1 }).total;
    const removedCount = this.store.transaction(() => this.store.deleteAllTracks());

    return {
      scannedCount,
      removedCount,
    };
  }

  async waitForScan(jobId: string): Promise<void> {
    await this.scanJobQueue.waitForIdle(jobId);
  }

  close(): void {
    this.closeDatabase();
  }
}

export const createLibraryService = (
  databasePath: string,
  dependencies: LibraryServiceDependencies = {},
): LibraryService => {
  const database = createDatabase(databasePath);
  const store = new LibraryStore(database);
  const fileScanner = dependencies.fileScanner ?? new TsFileScanner();
  const metadataReader =
    dependencies.metadataReader ??
    (dependencies.metadataService
      ? {
          read: async (filePath: string) =>
            inflateMetadataResult(
              await dependencies.metadataService!.read({
                path: filePath,
                folderId: '',
                sizeBytes: 0,
                mtimeMs: 0,
              }),
            ),
        }
      : new TsMetadataReader());
  const coverExtractor = dependencies.coverExtractor ?? new TsCoverExtractor();
  const coverCacheDir = dependencies.coverCacheDir ?? join(dirname(databasePath), 'cover-cache');
  const albumService = new AlbumService();
  const scanJobQueue = new ScanJobQueue(store, fileScanner, metadataReader, coverExtractor, albumService, {
    coverCacheDir,
    metadataConcurrency: dependencies.metadataConcurrency,
    coverConcurrency: dependencies.coverConcurrency,
  });

  const networkMetadataService = new NetworkMetadataService(database);

  return new LibraryService(store, scanJobQueue, albumService, () => database.close(), databasePath, coverCacheDir, networkMetadataService);
};

let defaultLibraryService: LibraryService | null = null;

export const getLibraryService = (): LibraryService => {
  if (!defaultLibraryService) {
    const electronApp = (electron as unknown as { app?: { getPath: (name: string) => string } }).app;

    if (!electronApp) {
      throw new Error('Electron app module is unavailable outside the Electron main process');
    }

    defaultLibraryService = createLibraryService(join(electronApp.getPath('userData'), 'echo-library.sqlite'));
  }

  return defaultLibraryService;
};

const pathSize = (targetPath: string): number | null => {
  try {
    return existsSync(targetPath) ? statSync(targetPath).size : null;
  } catch {
    return null;
  }
};

const cleanText = (value: string, fallback = ''): string => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const cleanNullableText = (value: string | null): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const cleanNullableNumber = (value: number | null): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  return rounded > 0 ? rounded : null;
};

const normalizeEditableTags = (tags: EditableTrackTags, previous: LibraryTrack): EditableTrackTags => {
  const title = cleanText(tags.title, previous.title || 'Untitled');
  const artist = cleanText(tags.artist, previous.artist || 'Unknown Artist');

  return {
    title,
    artist,
    album: cleanText(tags.album),
    albumArtist: cleanText(tags.albumArtist, artist),
    trackNo: cleanNullableNumber(tags.trackNo),
    discNo: cleanNullableNumber(tags.discNo),
    year: cleanNullableNumber(tags.year),
    genre: cleanNullableText(tags.genre),
  };
};

const directorySize = (targetPath: string): number | null => {
  if (!existsSync(targetPath)) {
    return null;
  }

  let total = 0;
  const pending = [targetPath];

  try {
    while (pending.length) {
      const current = pending.pop()!;
      const stat = statSync(current);

      if (stat.isDirectory()) {
        for (const entry of readdirSync(current)) {
          pending.push(join(current, entry));
        }
      } else {
        total += stat.size;
      }
    }
  } catch {
    return null;
  }

  return total;
};
