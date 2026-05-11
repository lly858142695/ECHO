# ECHO Next Library Core

Phase 1 implements the smallest local-library loop: folders enter the library, scans discover audio files, metadata is parsed only when needed, SQLite stores the canonical catalog, and renderer list views read paged data.

The renderer is a consumer only. It never scans folders, parses metadata, builds album groups, or receives full cover payloads.

## Modules

`LibraryService`

- public facade used by IPC
- owns the default Library Core composition
- exposes folder, scan, track, album, and summary APIs

`LibraryStore`

- owns all SQLite reads and writes
- runs migrations
- performs paged track and album queries
- tracks scan jobs and incremental fingerprints

`LibraryScanner`

- recursively walks local folders
- filters supported audio extensions
- returns path, size, and mtime only

`MetadataService`

- reads embedded metadata with `music-metadata`
- normalizes title, artist, album, album artist, duration, codec, sample rate, bit depth, bitrate
- records field sources in `field_sources_json`

`CoverService`

- reserves the `thumb`, `large`, and `original` structure
- deduplicates embedded covers by hash
- never returns full cover data from list APIs

`AlbumService`

- owns `album_key` generation
- groups by normalized `albumArtist + album`
- prevents same-title albums by different album artists from merging

`ScanJobQueue`

- starts background scan jobs
- supports status, progress, cancellation, and error collection
- skips unchanged files by path, size, and mtime

## SQLite Schema

Core tables:

- `folders`: imported local roots
- `tracks`: canonical track metadata and incremental file fingerprint
- `albums`: grouped album records
- `album_tracks`: album-track relationship
- `artists`: basic track and album artist index
- `covers`: reserved cover asset paths for `cover_thumb`, `cover_large`, `cover_original`
- `scan_jobs`: scan status, progress, cancellation, and errors

Required indexes:

- `tracks(path)`
- `tracks(folder_id)`
- `tracks(title)`
- `tracks(artist)`
- `tracks(album)`
- `albums(album_key)`
- `album_tracks(album_id)`
- `folders(path)`

## Scan Pipeline

1. `library.scanFolder(folderId)` creates a `scan_jobs` row and returns the job.
2. `ScanJobQueue` runs in the background.
3. `LibraryScanner` discovers audio files and stats each file.
4. Existing `tracks.path` rows are compared by `size_bytes + mtime_ms`.
5. Unchanged files are counted as skipped and metadata parsing is not called.
6. Changed or new files are parsed by `MetadataService`.
7. Scan writes run in a SQLite transaction:
   - cover placeholders/hashes are inserted if needed
   - tracks are upserted
   - albums are rebuilt
   - artists are rebuilt
   - scan status is finalized
8. Renderer polls `getScanStatus(jobId)` when it needs progress.

## Metadata Priority

The fixed priority is:

1. user manual edit
2. embedded tags
3. sidecar/info files
4. folder structure
5. network completion
6. filename fallback

Phase 1 implements embedded tags, folder album fallback, and filename fallback. Manual edits, sidecar metadata, and network completion are reserved by `field_sources_json`.

Filename fallback is only used when an embedded field is missing. It must never overwrite embedded `title`, `artist`, or `album`.

## Cover Priority

The fixed priority is:

1. user manual cover
2. embedded cover
3. local folder cover
4. sidecar cover
5. network cover
6. generated placeholder

Phase 1 stores the cover record shape and embedded-cover hash, but does not generate real thumbnail files yet. List APIs return `coverThumb` only. They never return `cover_large`, `cover_original`, or base64 image payloads.

## Pagination API

Track and album lists use:

- `page`
- `pageSize`
- `search`
- `sort`

`SongsPage` starts with `pageSize = 100`. `AlbumsPage` starts with `pageSize = 60`.

The response shape is:

- `items`
- `page`
- `pageSize`
- `total`
- `hasMore`

## Testing Strategy

Phase 1 tests cover:

- migration initialization
- folder insertion
- unchanged file skip behavior
- changed mtime reparse behavior
- metadata priority
- album grouping boundaries
- paginated track queries
- list API cover safety

Tests use real SQLite and scanner behavior with a mock metadata reader so incremental scan behavior stays deterministic.
