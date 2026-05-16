import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDataProtectionSnapshot,
  getProtectedUserDataPath,
  initializeProtectedUserDataPath,
  migrateLegacyProtectedData,
  restoreMissingProtectedData,
  writeDataProtectionManifest,
} from './dataProtection';

vi.mock('electron', () => ({
  app: {
    getName: () => 'ECHO NEXT',
    getPath: (name: string) => (name === 'appData' ? tmpdir() : tmpdir()),
    getVersion: () => '26.5.16-test',
    setPath: vi.fn(),
  },
}));

const readText = (path: string): string => readFileSync(path, 'utf8');

describe('dataProtection', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'echo-data-protection-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('pins userData to a stable appData folder', () => {
    const calls: Array<[string, string]> = [];
    const fakeApp = {
      getPath: (name: string) => (name === 'appData' ? tempDir : join(tempDir, 'Wrong Product Name')),
      setPath: (name: string, value: string) => calls.push([name, value]),
    };

    expect(getProtectedUserDataPath(fakeApp)).toBe(join(tempDir, 'ECHO NEXT'));
    expect(initializeProtectedUserDataPath(fakeApp)).toBe(join(tempDir, 'ECHO NEXT'));
    expect(calls).toEqual([['userData', join(tempDir, 'ECHO NEXT')]]);
  });

  it('restores missing settings and library files from the latest snapshot without overwriting existing data', () => {
    const settingsPath = join(tempDir, 'echo-settings.json');
    const libraryPath = join(tempDir, 'echo-library.sqlite');
    writeFileSync(settingsPath, '{"theme":"dark"}\n', 'utf8');
    writeFileSync(libraryPath, 'library-v1', 'utf8');

    const snapshot = createDataProtectionSnapshot('startup', tempDir, new Date('2026-05-16T00:00:00.000Z'));
    expect(snapshot.copied).toEqual(expect.arrayContaining(['echo-settings.json', 'echo-library.sqlite']));

    writeFileSync(settingsPath, '{"theme":"light"}\n', 'utf8');
    rmSync(libraryPath);

    const restore = restoreMissingProtectedData(tempDir);

    expect(restore.restored).toEqual(['echo-library.sqlite']);
    expect(readText(settingsPath)).toBe('{"theme":"light"}\n');
    expect(readText(libraryPath)).toBe('library-v1');
  });

  it('migrates stronger legacy echo-next data over a fresh protected directory', () => {
    const targetDir = join(tempDir, 'ECHO NEXT');
    const legacyDir = join(tempDir, 'echo-next');
    const targetLibraryPath = join(targetDir, 'echo-library.sqlite');
    const legacyLibraryPath = join(legacyDir, 'echo-library.sqlite');

    mkdirSync(targetDir, { recursive: true });
    mkdirSync(legacyDir, { recursive: true });
    writeFileSync(join(targetDir, 'echo-settings.json'), '{"theme":"fresh"}\n', { encoding: 'utf8', flag: 'w' });
    writeFileSync(targetLibraryPath, Buffer.alloc(512 * 1024));
    writeFileSync(join(legacyDir, 'echo-settings.json'), '{"theme":"old"}\n', { encoding: 'utf8', flag: 'w' });
    writeFileSync(legacyLibraryPath, Buffer.alloc(2 * 1024 * 1024));

    const migration = migrateLegacyProtectedData(targetDir, [legacyDir]);

    expect(migration.sourcePath).toBe(legacyDir);
    expect(migration.migrated).toEqual(expect.arrayContaining(['echo-settings.json', 'echo-library.sqlite']));
    expect(readText(join(targetDir, 'echo-settings.json'))).toBe('{"theme":"old"}\n');
    expect(readFileSync(targetLibraryPath).length).toBe(2 * 1024 * 1024);
    expect(existsSync(join(targetDir, 'data-protection', 'snapshots'))).toBe(true);
  });

  it('migrates legacy settings and account data even when the old library is small', () => {
    const targetDir = join(tempDir, 'ECHO NEXT');
    const legacyDir = join(tempDir, 'echo-next');

    mkdirSync(targetDir, { recursive: true });
    mkdirSync(legacyDir, { recursive: true });
    writeFileSync(join(targetDir, 'echo-settings.json'), '{"theme":"fresh"}\n', 'utf8');
    writeFileSync(join(targetDir, 'echo-library.sqlite'), Buffer.alloc(256 * 1024));
    writeFileSync(join(legacyDir, 'echo-settings.json'), '{"theme":"custom"}\n', 'utf8');
    writeFileSync(join(legacyDir, 'echo-library.sqlite'), Buffer.alloc(320 * 1024));
    writeFileSync(join(legacyDir, 'accounts.json'), '{"providers":["spotify"]}\n', 'utf8');
    writeFileSync(join(legacyDir, 'eq-presets.json'), '{"presets":["my-eq"]}\n', 'utf8');

    const migration = migrateLegacyProtectedData(targetDir, [legacyDir]);

    expect(migration.sourcePath).toBe(legacyDir);
    expect(migration.migrated).toEqual(expect.arrayContaining(['echo-settings.json', 'accounts.json', 'eq-presets.json']));
    expect(readText(join(targetDir, 'echo-settings.json'))).toBe('{"theme":"custom"}\n');
    expect(readText(join(targetDir, 'accounts.json'))).toContain('spotify');
  });

  it('does not replace an actively used protected directory with weaker legacy data', () => {
    const targetDir = join(tempDir, 'ECHO NEXT');
    const legacyDir = join(tempDir, 'echo-next');

    mkdirSync(targetDir, { recursive: true });
    mkdirSync(legacyDir, { recursive: true });
    writeFileSync(join(targetDir, 'echo-settings.json'), '{"theme":"current"}\n', 'utf8');
    writeFileSync(join(targetDir, 'echo-library.sqlite'), Buffer.alloc(4 * 1024 * 1024));
    writeFileSync(join(targetDir, 'accounts.json'), '{"providers":["current"]}\n', 'utf8');
    writeFileSync(join(legacyDir, 'echo-settings.json'), '{"theme":"old"}\n', 'utf8');
    writeFileSync(join(legacyDir, 'echo-library.sqlite'), Buffer.alloc(256 * 1024));

    const migration = migrateLegacyProtectedData(targetDir, [legacyDir]);

    expect(migration.sourcePath).toBeNull();
    expect(readText(join(targetDir, 'echo-settings.json'))).toBe('{"theme":"current"}\n');
    expect(readText(join(targetDir, 'accounts.json'))).toContain('current');
  });

  it('writes a manifest that lists protected user data entries', () => {
    writeDataProtectionManifest(tempDir);

    const manifestPath = join(tempDir, 'data-protection', 'echo-data-protection.json');
    const manifest = JSON.parse(readText(manifestPath)) as {
      protectedUserDataPath: string;
      protectedEntries: Array<{ name: string; path: string }>;
    };

    expect(existsSync(manifestPath)).toBe(true);
    expect(manifest.protectedUserDataPath).toBe(tempDir);
    expect(manifest.protectedEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'echo-settings.json', path: settingsPathFor(tempDir, 'echo-settings.json') }),
        expect.objectContaining({ name: 'echo-library.sqlite', path: settingsPathFor(tempDir, 'echo-library.sqlite') }),
      ]),
    );
  });
});

const settingsPathFor = (root: string, name: string): string => join(root, name);
