import { basename, dirname, extname } from 'node:path';
import { parseFile } from 'music-metadata';
import type { IAudioMetadata } from 'music-metadata';
import type { FieldSource, FieldSources, ParsedTrackMetadata, ScannedAudioFile } from './libraryTypes';

const unknownArtist = 'Unknown Artist';
const unknownAlbum = 'Unknown Album';

const cleanText = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const guessFromFilename = (filePath: string): { artist: string | null; title: string } => {
  const name = basename(filePath, extname(filePath)).trim();
  const parts = name.split(' - ').map((part) => part.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return {
      artist: parts[0],
      title: parts.slice(1).join(' - '),
    };
  }

  return {
    artist: null,
    title: name || 'Untitled',
  };
};

const folderAlbumFallback = (filePath: string): string | null => {
  const folderName = basename(dirname(filePath)).trim();
  return folderName.length > 0 ? folderName : null;
};

const codecFallback = (filePath: string, embeddedCodec: string | undefined): string | null => {
  const codec = cleanText(embeddedCodec);
  if (codec) {
    return codec;
  }

  const extension = extname(filePath).replace('.', '').toUpperCase();
  return extension.length > 0 ? extension : null;
};

export class MetadataService {
  async read(file: ScannedAudioFile): Promise<ParsedTrackMetadata> {
    const metadata = await parseFile(file.path, {
      duration: true,
      skipCovers: false,
    });

    return this.normalize(file.path, metadata);
  }

  normalize(filePath: string, metadata: IAudioMetadata): ParsedTrackMetadata {
    const common = metadata.common;
    const format = metadata.format;
    const filenameGuess = guessFromFilename(filePath);
    const fieldSources: FieldSources = {};

    // Fixed metadata priority for every field:
    // user manual > embedded tags > sidecar/info > folder structure > network completion > filename fallback.
    // Phase 1 only implements embedded, folder album fallback, and filename fallback. The source map keeps
    // the higher-priority slots explicit so later phases can add manual/sidecar/network without changing rows.
    const pick = (field: string, embeddedValue: string | null, fallbackValue: string, fallbackSource: FieldSource) => {
      if (embeddedValue) {
        fieldSources[field] = 'embedded';
        return embeddedValue;
      }

      fieldSources[field] = fallbackSource;
      return fallbackValue;
    };

    const embeddedTitle = cleanText(common.title);
    const embeddedArtist = cleanText(common.artist ?? common.artists?.[0]);
    const embeddedAlbum = cleanText(common.album);
    const embeddedAlbumArtist = cleanText(common.albumartist);
    const folderAlbum = folderAlbumFallback(filePath);

    const title = pick('title', embeddedTitle, filenameGuess.title, 'filename_fallback');
    const artist = pick('artist', embeddedArtist, filenameGuess.artist ?? unknownArtist, 'filename_fallback');
    const album = pick('album', embeddedAlbum, folderAlbum ?? unknownAlbum, folderAlbum ? 'folder_structure' : 'unknown');
    const albumArtist = pick('albumArtist', embeddedAlbumArtist, artist, fieldSources.artist);

    const picture = common.picture?.[0];

    return {
      title,
      artist,
      album,
      albumArtist,
      duration: Math.max(0, Number(format.duration ?? 0)),
      codec: codecFallback(filePath, format.codec),
      sampleRate: typeof format.sampleRate === 'number' ? format.sampleRate : null,
      bitDepth: typeof format.bitsPerSample === 'number' ? format.bitsPerSample : null,
      bitrate: typeof format.bitrate === 'number' ? Math.round(format.bitrate) : null,
      fieldSources,
      embeddedCover: picture
        ? {
            data: picture.data,
            mimeType: cleanText(picture.format),
          }
        : undefined,
    };
  }
}
