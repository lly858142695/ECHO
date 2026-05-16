import { describe, expect, it, vi } from 'vitest';
import { NeteaseArtistImageProvider } from './NeteaseArtistImageProvider';

describe('NeteaseArtistImageProvider', () => {
  it('maps NetEase artist search results to avatar candidates', async () => {
    const streamingProvider = {
      search: vi.fn().mockResolvedValue({
        artists: [
          {
            id: 'netease:artist:55240314',
            provider: 'netease',
            providerArtistId: '55240314',
            name: 'Arika',
            avatarUrl: 'https://p2.music.126.net/avatar.jpg?param=160y160',
            coverUrl: 'https://p2.music.126.net/cover.jpg',
          },
        ],
      }),
    };
    const provider = new NeteaseArtistImageProvider(streamingProvider as never);

    const candidates = await provider.searchArtistImage({ artistName: 'Arika', artistKey: 'arika' });

    expect(streamingProvider.search).toHaveBeenCalledWith({
      provider: 'netease',
      query: 'Arika',
      mediaTypes: ['artist'],
      page: 1,
      pageSize: 8,
    });
    expect(candidates[0]).toMatchObject({
      provider: 'netease',
      providerArtistId: '55240314',
      artistName: 'Arika',
      imageUrl: 'https://p2.music.126.net/cover.jpg?param=500y500',
      sourceUrl: 'https://music.163.com/#/artist?id=55240314',
      confidence: 0.96,
    });
  });
});
