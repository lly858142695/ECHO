import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithNetworkProxy } from '../network/networkFetch';
import { LrclibProvider } from './LrclibProvider';

vi.mock('../network/networkFetch', () => ({
  fetchWithNetworkProxy: vi.fn(),
}));

const fetchMock = vi.mocked(fetchWithNetworkProxy);

const jsonResponse = (value: unknown): Response =>
  new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('LrclibProvider', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('uses LRCLIB q search before falling back to structured search parameters', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          id: 1,
          trackName: 'Never Gonna Give You Up',
          artistName: 'Rick Astley',
          albumName: 'Whenever You Need Somebody',
          duration: 214,
          plainLyrics: 'Line',
          syncedLyrics: '[00:01.00]Line',
        },
      ]),
    );

    const provider = new LrclibProvider();
    const candidates = await provider.searchCandidates({
      title: 'Never Gonna Give You Up',
      artist: 'Rick Astley',
      album: null,
      durationSeconds: 214,
    });

    expect(candidates).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain('/api/search?');
    expect(calledUrl).toContain('q=Never+Gonna+Give+You+Up+Rick+Astley');
    expect(calledUrl).not.toContain('track_name=');
  });

  it('falls back to structured LRCLIB search when q search is empty', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 2,
            trackName: 'Echo Song',
            artistName: 'Echo Artist',
            albumName: 'Echo Album',
            duration: 120,
            plainLyrics: 'Line',
          },
        ]),
      );

    const provider = new LrclibProvider();
    const candidates = await provider.searchCandidates({
      title: 'Echo Song',
      artist: 'Echo Artist',
      album: 'Echo Album',
      durationSeconds: 120,
    });

    expect(candidates).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain('q=Echo+Song+Echo+Artist');
    expect(String(fetchMock.mock.calls[1][0])).toContain('track_name=Echo+Song');
    expect(String(fetchMock.mock.calls[1][0])).toContain('artist_name=Echo+Artist');
  });
});
