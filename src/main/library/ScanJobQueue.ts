import { randomUUID } from 'node:crypto';
import type { AlbumService } from './AlbumService';
import type { CoverService } from './CoverService';
import type { LibraryScanner } from './LibraryScanner';
import type { LibraryStore } from './LibraryStore';
import type { MetadataService } from './MetadataService';
import type { LibraryFolder, LibraryScanStatus, ParsedTrackMetadata, ScannedAudioFile } from './libraryTypes';

type ParsedScanItem = {
  file: ScannedAudioFile;
  metadata: ParsedTrackMetadata;
  existingTrackId: string | null;
};

export class ScanJobQueue {
  private readonly runningJobs = new Map<string, Promise<void>>();

  constructor(
    private readonly store: LibraryStore,
    private readonly scanner: LibraryScanner,
    private readonly metadataService: MetadataService,
    private readonly coverService: CoverService,
    private readonly albumService: AlbumService,
  ) {}

  scanFolder(folder: LibraryFolder): LibraryScanStatus {
    const job = this.store.createScanJob(folder.id);
    const run = this.runJob(job.id, folder).finally(() => {
      this.runningJobs.delete(job.id);
    });

    this.runningJobs.set(job.id, run);

    return job;
  }

  getScanStatus(jobId: string): LibraryScanStatus {
    const job = this.store.getScanJob(jobId);

    if (!job) {
      throw new Error(`Unknown scan job ${jobId}`);
    }

    return job;
  }

  cancelScan(jobId: string): LibraryScanStatus {
    const current = this.getScanStatus(jobId);

    if (current.status === 'completed' || current.status === 'failed' || current.status === 'cancelled') {
      return current;
    }

    return this.store.updateScanJob(jobId, {
      cancelRequested: true,
      status: current.status === 'queued' ? 'cancelled' : current.status,
      finishedAt: current.status === 'queued' ? new Date().toISOString() : current.finishedAt,
    });
  }

  async waitForIdle(jobId: string): Promise<void> {
    await this.runningJobs.get(jobId);
  }

  private async runJob(jobId: string, folder: LibraryFolder): Promise<void> {
    const startedAt = new Date().toISOString();
    let processedFiles = 0;
    let skippedFiles = 0;
    let addedTracks = 0;
    let updatedTracks = 0;
    const errors: string[] = [];

    try {
      this.store.updateScanJob(jobId, {
        status: 'running',
        startedAt,
      });

      const files = await this.scanner.scanFolder(folder.id, folder.path);
      this.store.updateScanJob(jobId, {
        totalFiles: files.length,
      });

      const changedItems: ParsedScanItem[] = [];

      for (const file of files) {
        if (this.store.isScanCancelled(jobId)) {
          this.store.updateScanJob(jobId, {
            status: 'cancelled',
            processedFiles,
            skippedFiles,
            errors,
            finishedAt: new Date().toISOString(),
          });
          return;
        }

        const existing = this.store.findTrackFingerprint(file.path);

        if (existing && existing.sizeBytes === file.sizeBytes && existing.mtimeMs === file.mtimeMs) {
          processedFiles += 1;
          skippedFiles += 1;
          this.store.updateScanJob(jobId, {
            processedFiles,
            skippedFiles,
          });
          continue;
        }

        try {
          const metadata = await this.metadataService.read(file);
          changedItems.push({
            file,
            metadata,
            existingTrackId: existing?.id ?? null,
          });
        } catch (error) {
          errors.push(`${file.path}: ${error instanceof Error ? error.message : String(error)}`);
        }

        processedFiles += 1;
        this.store.updateScanJob(jobId, {
          processedFiles,
          skippedFiles,
          errors,
        });
      }

      this.store.transaction(() => {
        const timestamp = new Date().toISOString();

        for (const item of changedItems) {
          const coverId = this.coverService.ensureCover(item.metadata, timestamp);
          const result = this.store.upsertTrack({
            ...item.file,
            ...item.metadata,
            id: item.existingTrackId ?? randomUUID(),
            coverId,
            updatedAt: timestamp,
          });

          if (result === 'added') {
            addedTracks += 1;
          } else {
            updatedTracks += 1;
          }
        }

        this.store.refreshAlbums(this.albumService, timestamp);
        this.store.refreshArtists();
        this.store.updateScanJob(jobId, {
          status: errors.length > 0 ? 'failed' : 'completed',
          processedFiles,
          skippedFiles,
          addedTracks,
          updatedTracks,
          errors,
          finishedAt: new Date().toISOString(),
        });
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      this.store.updateScanJob(jobId, {
        status: 'failed',
        processedFiles,
        skippedFiles,
        addedTracks,
        updatedTracks,
        errors,
        finishedAt: new Date().toISOString(),
      });
    }
  }

}
