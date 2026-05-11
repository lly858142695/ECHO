import type { AudioStatus } from '../shared/types/audio';
import type {
  LibraryAlbum,
  LibraryFolder,
  LibraryPage,
  LibraryPageQuery,
  LibraryScanStatus,
  LibrarySummary,
  LibraryTrack,
} from '../shared/types/library';
import type { PlaybackStatus } from '../shared/types/playback';

export type EchoApi = {
  app: {
    getVersion: () => Promise<string>;
  };
  library: {
    addFolder: (path: string) => Promise<LibraryFolder>;
    getFolders: () => Promise<LibraryFolder[]>;
    removeFolder: (folderId: string) => Promise<void>;
    scanFolder: (folderId: string) => Promise<LibraryScanStatus>;
    getScanStatus: (jobId: string) => Promise<LibraryScanStatus>;
    cancelScan: (jobId: string) => Promise<LibraryScanStatus>;
    getTracks: (query?: LibraryPageQuery) => Promise<LibraryPage<LibraryTrack>>;
    getAlbums: (query?: LibraryPageQuery) => Promise<LibraryPage<LibraryAlbum>>;
    getSummary: () => Promise<LibrarySummary>;
  };
  playback: {
    getStatus: () => Promise<PlaybackStatus>;
  };
  audio: {
    getStatus: () => Promise<AudioStatus>;
  };
};

declare global {
  interface Window {
    echo: EchoApi;
  }
}
