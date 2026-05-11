# ECHO Next Roadmap

## Phase 0: Skeleton

- Electron + React + TypeScript + Vite
- electron-vite build pipeline
- typed preload API
- main IPC registration
- empty UI shell
- architecture and rule documents

Current Phase 0 intentionally does not implement scanning, playback, or SQLite.

## Phase 1: Library Core

- SQLite schema and migrations for folders, tracks, albums, album tracks, artists, covers, and scan jobs
- local library folders
- background scan jobs with status, cancellation, progress, and errors
- incremental scanning by `path + size_bytes + mtime_ms`
- embedded metadata reading
- cover asset structure for thumb, large, and original
- transaction-backed scan writes
- album grouping by album title and album artist
- `SongsPage` with paged API reads and virtualized rows
- `AlbumsPage` with paged album wall
- focused tests for migration, scanning, metadata priority, album grouping, pagination, and cover safety

Deferred beyond the minimal Phase 1 loop:

- FTS-backed search
- real thumbnail generation
- manual metadata editing
- sidecar metadata
- network completion
- artist detail pages

## Phase 2: Audio Core

- local file playback
- `AudioSession` state machine
- device listing
- native output bridge inspired by `echo-audio-host`
- position events from output-side timing
- play, pause, seek, stop, next, previous
- ended and error events

## Phase 3: HiFi

- WASAPI Exclusive
- ASIO
- bit-perfect output path
- sample-rate switching
- gapless playback
- output format verification

## Phase 4: Experience

- lyrics
- MV
- streaming
- downloader
- Last.fm
- Discord RPC
- plugins

Experience features wait until the library and audio cores are stable.
