import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { ScannedAudioFile } from './libraryTypes';

const audioExtensions = new Set([
  '.aac',
  '.aiff',
  '.alac',
  '.ape',
  '.dsf',
  '.dff',
  '.flac',
  '.m4a',
  '.mp3',
  '.ogg',
  '.opus',
  '.wav',
  '.wv',
]);

export class LibraryScanner {
  async scanFolder(folderId: string, folderPath: string): Promise<ScannedAudioFile[]> {
    const files: ScannedAudioFile[] = [];
    await this.walk(resolve(folderPath), folderId, files);
    return files;
  }

  private async walk(directoryPath: string, folderId: string, files: ScannedAudioFile[]): Promise<void> {
    const entries = await readdir(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        await this.walk(entryPath, folderId, files);
        continue;
      }

      if (!entry.isFile() || !audioExtensions.has(this.getExtension(entry.name))) {
        continue;
      }

      const fileStat = await stat(entryPath);

      files.push({
        path: resolve(entryPath),
        folderId,
        sizeBytes: fileStat.size,
        mtimeMs: Math.round(fileStat.mtimeMs),
      });
    }
  }

  private getExtension(fileName: string): string {
    const index = fileName.lastIndexOf('.');
    return index >= 0 ? fileName.slice(index).toLocaleLowerCase() : '';
  }
}
