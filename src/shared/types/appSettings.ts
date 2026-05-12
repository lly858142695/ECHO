import type { PlaybackSpeedMode } from './audio';

export type AppSettings = {
  hideToTrayOnClose: boolean;
  networkMetadataEnabled: boolean;
  networkMetadataProviders: Array<'mock' | 'musicbrainz' | 'cover-art-archive' | 'netease-cloud-music' | 'qq-music'>;
  playerVolume: number;
  playbackSpeed: number;
  playbackSpeedMode: PlaybackSpeedMode;
};
