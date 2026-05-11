import { createHash, randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { ParsedTrackMetadata } from './libraryTypes';

export class CoverService {
  constructor(private readonly database: DatabaseSync) {}

  ensureCover(metadata: ParsedTrackMetadata, now = new Date().toISOString()): string | null {
    if (!metadata.embeddedCover) {
      return null;
    }

    const sourceHash = createHash('sha256').update(metadata.embeddedCover.data).digest('hex');
    const existing = this.database.prepare('SELECT id FROM covers WHERE source_hash = ?').get(sourceHash);

    if (typeof existing?.id === 'string') {
      return existing.id;
    }

    const id = randomUUID();

    this.database
      .prepare(
        `INSERT INTO covers (
          id, source_type, source_hash, mime_type, cover_thumb, cover_large, cover_original, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(id, 'embedded', sourceHash, metadata.embeddedCover.mimeType, null, null, null, now, now);

    return id;
  }
}
