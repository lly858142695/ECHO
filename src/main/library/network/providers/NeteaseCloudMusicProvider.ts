import type { NetworkMetadataProvider } from '../NetworkMetadataProvider';
import type { NetworkMetadataCandidateInput, NetworkTrackLookup } from '../networkTypes';
import { asRecord, buildSearchQuery, fetchJsonWithTimeout, number, text } from './providerFetch';

export class NeteaseCloudMusicProvider implements NetworkMetadataProvider {
  readonly name = 'netease-cloud-music' as const;

  async findMetadata(track: NetworkTrackLookup, signal?: AbortSignal): Promise<NetworkMetadataCandidateInput[]> {
    const query = buildSearchQuery(track.title, track.artist, track.filename);
    if (!query) {
      return [];
    }

    const params = new URLSearchParams({ type: '1', s: query, limit: '5', offset: '0' });
    const data = asRecord(
      await fetchJsonWithTimeout(`https://music.163.com/api/search/get/web?${params.toString()}`, signal, {
        Referer: 'https://music.163.com/',
      }),
    );
    const result = asRecord(data.result);
    const songs = Array.isArray(result.songs) ? result.songs : [];

    return songs.map((songValue): NetworkMetadataCandidateInput => {
      const song = asRecord(songValue);
      const album = asRecord(song.album);
      const artists = Array.isArray(song.artists) ? song.artists.map(asRecord) : [];
      const firstArtist = artists[0] ?? {};
      const artistName = artists.map((artist) => text(artist.name)).filter(Boolean).join(' / ') || text(firstArtist.name);
      const durationMs = number(song.duration);

      return {
        provider: this.name,
        providerItemId: `netease:${String(song.id ?? text(song.name) ?? track.trackId)}`,
        title: text(song.name),
        artist: artistName,
        album: text(album.name),
        albumArtist: artistName,
        year: null,
        genre: null,
        duration: durationMs ? durationMs / 1000 : null,
        trackNo: null,
        discNo: null,
        coverUrl: text(album.picUrl),
        raw: song,
      };
    });
  }
}
