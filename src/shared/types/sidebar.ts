export const sidebarRouteIds = [
  'home',
  'songs',
  'downloads',
  'osu-downloader',
  'albums',
  'artists',
  'folders',
  'queue',
  'history',
  'playlists',
  'liked',
  'inbox',
  'streaming',
  'dsp',
  'audio-settings',
  'remote',
  'connect',
  'plugins',
  'settings',
  'lyrics-settings',
  'import-folder',
  'import-file',
] as const;

export type SidebarRouteId = typeof sidebarRouteIds[number];

export const defaultSidebarRouteOrder: SidebarRouteId[] = [...sidebarRouteIds];
export const defaultSidebarHiddenRouteIds: SidebarRouteId[] = [
  'streaming',
  'inbox',
  'import-folder',
  'lyrics-settings',
  'import-file',
];
export const lockedVisibleSidebarRouteIds: SidebarRouteId[] = ['settings'];
export const lockedHiddenSidebarRouteIds: SidebarRouteId[] = ['streaming'];

const sidebarRouteIdSet = new Set<string>(sidebarRouteIds);
const lockedVisibleSidebarRouteIdSet = new Set<string>(lockedVisibleSidebarRouteIds);
const lockedHiddenSidebarRouteIdSet = new Set<string>(lockedHiddenSidebarRouteIds);

export const isSidebarRouteId = (value: unknown): value is SidebarRouteId =>
  typeof value === 'string' && sidebarRouteIdSet.has(value);

export const normalizeSidebarRouteOrder = (value: unknown): SidebarRouteId[] => {
  if (!Array.isArray(value)) {
    return [...defaultSidebarRouteOrder];
  }

  const seen = new Set<SidebarRouteId>();
  const result: SidebarRouteId[] = [];

  for (const item of value) {
    if (isSidebarRouteId(item) && !seen.has(item)) {
      result.push(item);
      seen.add(item);
    }
  }

  for (const id of defaultSidebarRouteOrder) {
    if (!seen.has(id)) {
      result.push(id);
      seen.add(id);
    }
  }

  return result;
};

export const normalizeSidebarHiddenRouteIds = (value: unknown): SidebarRouteId[] => {
  const hiddenRouteIds: SidebarRouteId[] = [...lockedHiddenSidebarRouteIds];
  const seen = new Set<SidebarRouteId>(lockedHiddenSidebarRouteIds);

  if (!Array.isArray(value)) {
    return hiddenRouteIds;
  }

  for (const item of value) {
    if (!isSidebarRouteId(item) || lockedVisibleSidebarRouteIdSet.has(item) || lockedHiddenSidebarRouteIdSet.has(item) || seen.has(item)) {
      continue;
    }

    hiddenRouteIds.push(item);
    seen.add(item);
  }

  return hiddenRouteIds;
};
