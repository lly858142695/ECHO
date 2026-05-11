export const IpcChannels = {
  AppGetVersion: 'app:get-version',
  LibraryAddFolder: 'library:add-folder',
  LibraryGetFolders: 'library:get-folders',
  LibraryRemoveFolder: 'library:remove-folder',
  LibraryScanFolder: 'library:scan-folder',
  LibraryGetScanStatus: 'library:get-scan-status',
  LibraryCancelScan: 'library:cancel-scan',
  LibraryGetTracks: 'library:get-tracks',
  LibraryGetAlbums: 'library:get-albums',
  LibraryGetSummary: 'library:get-summary',
  PlaybackGetStatus: 'playback:get-status',
  AudioGetStatus: 'audio:get-status',
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
