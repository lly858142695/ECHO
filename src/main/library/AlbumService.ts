import { createHash } from 'node:crypto';

const normalizeKeyPart = (value: string): string => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');

export class AlbumService {
  makeAlbumKey(albumTitle: string, albumArtist: string, trackId: string): string {
    const normalizedAlbum = normalizeKeyPart(albumTitle);

    if (normalizedAlbum.length === 0 || normalizedAlbum === 'unknown album') {
      return `unknown:${trackId}`;
    }

    const normalizedArtist = normalizeKeyPart(albumArtist || 'Unknown Artist');
    const digest = createHash('sha1').update(`${normalizedArtist}\u0000${normalizedAlbum}`).digest('hex');
    return digest;
  }
}
