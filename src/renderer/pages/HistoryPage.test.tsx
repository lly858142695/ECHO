// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type {
  LibraryPage,
  PlaybackHistoryEntry,
  PlaybackHistorySummary,
  PlaybackStatsDashboard,
} from '../../shared/types/library';
import { HistoryPage, resetHistoryPageCacheForTest } from './HistoryPage';

vi.mock('../stores/PlaybackQueueProvider', () => ({
  usePlaybackQueue: () => ({
    appendToQueue: vi.fn(),
    playTrack: vi.fn(),
  }),
}));

vi.mock('../utils/albumNavigation', () => ({
  openAlbumDetailForTrack: vi.fn(),
}));

vi.mock('../utils/artistNavigation', () => ({
  openArtistDetailByName: vi.fn(),
}));

const historyEntry = (id: string, overrides: Partial<PlaybackHistoryEntry> = {}): PlaybackHistoryEntry => ({
  id,
  trackId: id,
  trackPath: `D:\\Music\\${id}.flac`,
  mediaType: 'local',
  provider: null,
  providerTrackId: null,
  stableKey: null,
  title: `History ${id}`,
  artist: 'History Artist',
  album: 'History Album',
  albumArtist: 'History Artist',
  coverId: null,
  coverThumb: null,
  startedAt: '2026-05-25T09:00:00.000Z',
  endedAt: '2026-05-25T09:03:00.000Z',
  playedSeconds: 180,
  durationSeconds: 180,
  durationSnapshot: 180,
  coverSnapshot: null,
  playCount: 1,
  completed: true,
  sourceType: 'manual',
  sourceLabel: 'Songs',
  queueId: null,
  ...overrides,
});

const historyPage = (items: PlaybackHistoryEntry[]): LibraryPage<PlaybackHistoryEntry> => ({
  hasMore: false,
  items,
  page: 1,
  pageSize: 50,
  total: items.length,
});

const historySummary = (overrides: Partial<PlaybackHistorySummary> = {}): PlaybackHistorySummary => ({
  latestPlayedAt: '2026-05-25T09:00:00.000Z',
  rangeCount: 1,
  rangeLatestPlayedAt: '2026-05-25T09:00:00.000Z',
  rangePlayedSeconds: 180,
  todayCount: 1,
  todayPlayedSeconds: 180,
  totalCount: 1,
  ...overrides,
});

const stats = (): PlaybackStatsDashboard => ({
  dailyActivity: [],
  formatBreakdown: [],
  generatedAt: '2026-05-25T09:00:00.000Z',
  qualityBreakdown: [],
  topAlbums: [],
  topArtists: [],
  topTracks: [],
  totals: {
    completedCount: 1,
    playCount: 1,
    playedSeconds: 180,
    uniqueArtists: 1,
    uniqueTracks: 1,
  },
});

const installLibraryMock = (overrides: Partial<NonNullable<typeof window.echo>['library']> = {}) => {
  const library = {
    clearPlaybackHistory: vi.fn().mockResolvedValue(undefined),
    deletePlaybackHistoryEntry: vi.fn().mockResolvedValue(undefined),
    getPlaybackHistory: vi.fn().mockResolvedValue(historyPage([historyEntry('fresh')])),
    getPlaybackHistorySummary: vi.fn().mockResolvedValue(historySummary()),
    getPlaybackStatsDashboard: vi.fn().mockResolvedValue(stats()),
    ...overrides,
  };

  Object.defineProperty(window, 'echo', {
    configurable: true,
    value: { library },
  });

  return library;
};

afterEach(() => {
  cleanup();
  resetHistoryPageCacheForTest();
  vi.restoreAllMocks();
  Object.defineProperty(window, 'echo', {
    configurable: true,
    value: undefined,
  });
});

describe('HistoryPage', () => {
  it('shows the stored history snapshot immediately on cold launch', () => {
    window.localStorage.setItem(
      'echo-next.history-page-cache.v1',
      JSON.stringify({
        data: {
          filter: 'all',
          hasMore: false,
          items: [historyEntry('cached', { title: 'Cached History Track' })],
          page: 1,
          search: '',
          stats: null,
          summary: historySummary(),
          total: 1,
        },
        savedAt: '2026-05-25T10:00:00.000Z',
        version: 1,
      }),
    );
    installLibraryMock({
      getPlaybackHistory: vi.fn(() => new Promise<LibraryPage<PlaybackHistoryEntry>>(() => undefined)),
    });

    render(<HistoryPage />);

    expect(screen.getByText('Cached History Track')).toBeTruthy();
  });

  it('persists the first history page before stats dashboard refresh finishes', async () => {
    const pendingStats = new Promise<PlaybackStatsDashboard>(() => undefined);
    installLibraryMock({
      getPlaybackHistory: vi.fn().mockResolvedValue(historyPage([historyEntry('cached-before-stats')])),
      getPlaybackStatsDashboard: vi.fn(() => pendingStats),
    });

    render(<HistoryPage />);

    await screen.findByText('History cached-before-stats');
    await waitFor(() => {
      const cached = JSON.parse(window.localStorage.getItem('echo-next.history-page-cache.v1') ?? '{}') as {
        data?: { items?: Array<{ title?: string }> };
      };
      expect(cached.data?.items?.[0]?.title).toBe('History cached-before-stats');
    });
  });
});
