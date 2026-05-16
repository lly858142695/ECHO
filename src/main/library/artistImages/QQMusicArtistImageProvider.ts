import type { StreamingArtist } from '../../../shared/types/streaming';
import { QQMusicStreamingProvider } from '../../streaming/providers/QQMusicStreamingProvider';
import { ARTIST_IMAGE_AUTO_MATCH_MIN_CONFIDENCE, artistImageConfidence } from './ArtistImageMatching';
import type { ArtistImageCandidate, ArtistImageProvider } from './ArtistImageTypes';

const providerName = 'qqmusic';
const qqReferer = 'https://y.qq.com/';

const unwrapStreamingImageUrl = (url: string | null | undefined): string | null => {
  if (!url) {
    return null;
  }

  if (!url.startsWith('echo-image://remote/')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.replace(/^\/+/u, ''));
  } catch {
    return null;
  }
};

const artistSourceUrl = (artist: StreamingArtist): string | null =>
  artist.providerArtistId ? `https://y.qq.com/n/ryqq/singer/${encodeURIComponent(artist.providerArtistId)}` : null;

const text = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value.trim() : null);

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const parseJsonp = (raw: string): unknown => JSON.parse(raw.trim().replace(/^[^(]*\((.*)\);?$/s, '$1'));

const legacyArtistSearch = async (artistName: string): Promise<StreamingArtist[]> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const params = new URLSearchParams({
    p: '1',
    n: '8',
    w: artistName,
    format: 'json',
    t: '9',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    platform: 'yqq.json',
    needNewCode: '0',
  });
  try {
    const response = await fetch(`https://c.y.qq.com/soso/fcgi-bin/client_search_cp?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json,text/plain,*/*',
        Referer: qqReferer,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`qqmusic_legacy_artist_search_failed:${response.status}`);
    }

    const payload = asRecord(parseJsonp(await response.text()));
    const data = asRecord(payload.data);
    const singer = asRecord(data.singer);
    const list = Array.isArray(singer.list) ? singer.list : [];

    return list
      .map((item): StreamingArtist | null => {
        const record = asRecord(item);
        const providerArtistId = text(record.singerMID) ?? text(record.singermid) ?? text(record.mid) ?? text(record.singer_id);
        const name = text(record.singerName) ?? text(record.singername) ?? text(record.name);
        const rawAvatar = text(record.singerPic) ?? text(record.pic);
        const avatarUrl = rawAvatar?.startsWith('//') ? `https:${rawAvatar}` : rawAvatar?.replace(/^http:\/\//iu, 'https://') ?? null;

        if (!name || !avatarUrl) {
          return null;
        }

        return {
          id: `qqmusic:artist:${providerArtistId ?? name}`,
          provider: providerName,
          providerArtistId: providerArtistId ?? name,
          name,
          avatarUrl,
          coverUrl: avatarUrl,
        };
      })
      .filter((artist): artist is StreamingArtist => Boolean(artist));
  } finally {
    clearTimeout(timer);
  }
};

export class QQMusicArtistImageProvider implements ArtistImageProvider {
  readonly name = providerName;
  readonly minRequestIntervalMs = 650;

  constructor(private readonly streamingProvider = new QQMusicStreamingProvider()) {}

  async searchArtistImage(input: { artistName: string; artistKey: string }): Promise<ArtistImageCandidate[]> {
    const result = await this.streamingProvider.search({
      provider: providerName,
      query: input.artistName,
      mediaTypes: ['artist'],
      page: 1,
      pageSize: 8,
    });

    const artists = result.artists.length > 0 ? result.artists : await legacyArtistSearch(input.artistName);

    return artists
      .map((artist): ArtistImageCandidate | null => {
        const imageUrl = unwrapStreamingImageUrl(artist.avatarUrl ?? artist.coverUrl);
        if (!imageUrl) {
          return null;
        }

        return {
          provider: providerName,
          providerArtistId: artist.providerArtistId,
          artistName: artist.name,
          imageUrl,
          confidence: artistImageConfidence(input.artistName, artist.name),
          sourceUrl: artistSourceUrl(artist),
          sourceRef: artist.id,
        };
      })
      .filter((candidate): candidate is ArtistImageCandidate => Boolean(candidate))
      .sort((left, right) => {
        const scoreDelta = right.confidence - left.confidence;
        if (scoreDelta !== 0) {
          return scoreDelta;
        }

        return left.artistName.localeCompare(right.artistName);
      })
      .map((candidate) => ({
        ...candidate,
        confidence: Math.min(1, Math.max(0, candidate.confidence)),
      }))
      .filter((candidate, index) => index === 0 || candidate.confidence >= ARTIST_IMAGE_AUTO_MATCH_MIN_CONFIDENCE);
  }
}
