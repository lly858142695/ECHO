import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { app } from 'electron';

type DataProtectionReason = 'startup' | 'update-install';
type ProtectedEntryKind = 'file' | 'directory';

type ProtectedEntry = {
  name: string;
  kind: ProtectedEntryKind;
};

type SnapshotResult = {
  snapshotPath: string;
  copied: string[];
  skipped: string[];
};

type RestoreResult = {
  restored: string[];
  skipped: string[];
};

type LegacyMigrationResult = {
  sourcePath: string | null;
  migrated: string[];
  skipped: string[];
};

type UserDataScore = {
  path: string;
  score: number;
  protectedFiles: number;
  librarySize: number;
  hasSettings: boolean;
};

type ElectronPathName = Parameters<typeof app.getPath>[0];

type ElectronAppLike = {
  getName?: () => string;
  getPath: (name: ElectronPathName) => string;
  getVersion?: () => string;
  setPath?: (name: ElectronPathName, path: string) => void;
};

const protectedUserDataFolderName = 'ECHO NEXT';
const legacyUserDataFolderNames = ['echo-next', 'ECHO Next', 'ECHO'];
const dataProtectionDirectoryName = 'data-protection';
const snapshotDirectoryName = 'snapshots';
const manifestFileName = 'echo-data-protection.json';
const maxSnapshots = 5;

export const protectedDataEntries: ProtectedEntry[] = [
  { name: 'echo-settings.json', kind: 'file' },
  { name: 'echo-library.sqlite', kind: 'file' },
  { name: 'echo-library.sqlite-wal', kind: 'file' },
  { name: 'echo-library.sqlite-shm', kind: 'file' },
  { name: 'accounts.json', kind: 'file' },
  { name: 'echo-download-settings.json', kind: 'file' },
  { name: 'echo-playback-memory.json', kind: 'file' },
  { name: 'eq-presets.json', kind: 'file' },
  { name: 'app-wallpapers', kind: 'directory' },
  { name: 'lyrics-wallpapers', kind: 'directory' },
];

const timestampForPath = (date = new Date()): string => date.toISOString().replace(/[:.]/g, '-');

const safeReadJson = <T>(path: string): T | null => {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
};

export const getProtectedUserDataPath = (electronApp: ElectronAppLike = app): string => {
  const appDataPath = electronApp.getPath('appData');
  return join(appDataPath, protectedUserDataFolderName);
};

export const initializeProtectedUserDataPath = (electronApp: ElectronAppLike = app): string => {
  const protectedUserDataPath = getProtectedUserDataPath(electronApp);
  mkdirSync(protectedUserDataPath, { recursive: true });

  if (electronApp.setPath && electronApp.getPath('userData') !== protectedUserDataPath) {
    electronApp.setPath('userData', protectedUserDataPath);
  }

  return protectedUserDataPath;
};

const getDataProtectionPath = (userDataPath: string): string => join(userDataPath, dataProtectionDirectoryName);
const getSnapshotsPath = (userDataPath: string): string => join(getDataProtectionPath(userDataPath), snapshotDirectoryName);
const getLegacyUserDataPaths = (electronApp: ElectronAppLike = app): string[] => {
  const appDataPath = electronApp.getPath('appData');
  const protectedPath = getProtectedUserDataPath(electronApp).toLocaleLowerCase();

  return legacyUserDataFolderNames
    .map((folderName) => join(appDataPath, folderName))
    .filter((legacyPath, index, paths) => legacyPath.toLocaleLowerCase() !== protectedPath && paths.indexOf(legacyPath) === index);
};

const copyProtectedEntry = (sourcePath: string, targetPath: string, kind: ProtectedEntryKind): void => {
  mkdirSync(dirname(targetPath), { recursive: true });
  if (kind === 'directory') {
    cpSync(sourcePath, targetPath, { recursive: true, force: true, errorOnExist: false });
  } else {
    copyFileSync(sourcePath, targetPath);
  }
};

const listSnapshotPaths = (userDataPath: string): string[] => {
  const snapshotsPath = getSnapshotsPath(userDataPath);
  if (!existsSync(snapshotsPath)) {
    return [];
  }

  return readdirSync(snapshotsPath)
    .map((entry) => join(snapshotsPath, entry))
    .filter((entryPath) => {
      try {
        return statSync(entryPath).isDirectory();
      } catch {
        return false;
      }
    })
    .sort()
    .reverse();
};

const pruneOldSnapshots = (userDataPath: string): void => {
  for (const snapshotPath of listSnapshotPaths(userDataPath).slice(maxSnapshots)) {
    rmSync(snapshotPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  }
};

const fileSize = (path: string): number => {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
};

const directoryEntryCount = (path: string): number => {
  try {
    return statSync(path).isDirectory() ? readdirSync(path).length : 0;
  } catch {
    return 0;
  }
};

const scoreUserDataPath = (userDataPath: string): UserDataScore => {
  const librarySize = fileSize(join(userDataPath, 'echo-library.sqlite'));
  const hasSettings = existsSync(join(userDataPath, 'echo-settings.json'));
  let protectedFiles = 0;
  let score = Math.min(50, Math.floor(librarySize / (512 * 1024)));

  for (const entry of protectedDataEntries) {
    const entryPath = join(userDataPath, entry.name);
    if (!existsSync(entryPath)) {
      continue;
    }

    protectedFiles += 1;
    score += entry.kind === 'directory' ? Math.min(4, directoryEntryCount(entryPath)) : 4;
  }

  if (librarySize > 0 && librarySize < 1024 * 1024) {
    score += 3;
  }

  return { path: userDataPath, score, protectedFiles, librarySize, hasSettings };
};

const shouldMigrateLegacyUserData = (source: UserDataScore, target: UserDataScore): boolean => {
  if (source.protectedFiles === 0 || (!source.hasSettings && source.librarySize === 0)) {
    return false;
  }

  const targetLooksFresh =
    target.protectedFiles === 0 ||
    (target.librarySize > 0 && target.librarySize < 1024 * 1024 && target.score <= 16) ||
    (target.hasSettings && target.librarySize === 0 && target.score <= 8);

  if (targetLooksFresh && source.score > target.score) {
    return true;
  }

  const sourceHasMuchLargerLibrary = source.librarySize > 0 && (target.librarySize === 0 || source.librarySize > Math.max(1024 * 1024, target.librarySize * 2));
  return sourceHasMuchLargerLibrary && source.score >= target.score;
};

const findBestLegacyUserDataPath = (targetUserDataPath: string, legacyUserDataPaths = getLegacyUserDataPaths()): string | null => {
  const target = scoreUserDataPath(targetUserDataPath);
  const candidates = legacyUserDataPaths
    .filter((candidate) => existsSync(candidate))
    .map((candidate) => scoreUserDataPath(candidate))
    .filter((candidate) => candidate.protectedFiles > 0)
    .sort((a, b) => b.score - a.score);

  const best = candidates[0] ?? null;
  if (!best || !shouldMigrateLegacyUserData(best, target)) {
    return null;
  }

  return best.path;
};

export const migrateLegacyProtectedData = (
  targetUserDataPath = app.getPath('userData'),
  legacyUserDataPaths = getLegacyUserDataPaths(),
): LegacyMigrationResult => {
  const sourcePath = findBestLegacyUserDataPath(targetUserDataPath, legacyUserDataPaths);
  const migrated: string[] = [];
  const skipped: string[] = [];

  if (!sourcePath) {
    return { sourcePath: null, migrated, skipped: protectedDataEntries.map((entry) => entry.name) };
  }

  createDataProtectionSnapshot('startup', targetUserDataPath);

  for (const entry of protectedDataEntries) {
    const sourceEntryPath = join(sourcePath, entry.name);
    if (!existsSync(sourceEntryPath)) {
      skipped.push(entry.name);
      continue;
    }

    try {
      copyProtectedEntry(sourceEntryPath, join(targetUserDataPath, entry.name), entry.kind);
      migrated.push(entry.name);
    } catch {
      skipped.push(entry.name);
    }
  }

  return { sourcePath, migrated, skipped };
};

export const createDataProtectionSnapshot = (
  reason: DataProtectionReason,
  userDataPath = app.getPath('userData'),
  date = new Date(),
): SnapshotResult => {
  const snapshotsPath = getSnapshotsPath(userDataPath);
  const snapshotPath = join(snapshotsPath, `${timestampForPath(date)}-${reason}`);
  const copied: string[] = [];
  const skipped: string[] = [];

  mkdirSync(snapshotPath, { recursive: true });

  for (const entry of protectedDataEntries) {
    const sourcePath = join(userDataPath, entry.name);
    if (!existsSync(sourcePath)) {
      skipped.push(entry.name);
      continue;
    }

    try {
      copyProtectedEntry(sourcePath, join(snapshotPath, entry.name), entry.kind);
      copied.push(entry.name);
    } catch {
      skipped.push(entry.name);
    }
  }

  writeFileSync(
    join(snapshotPath, 'snapshot.json'),
    `${JSON.stringify({ formatVersion: 1, reason, createdAt: date.toISOString(), copied, skipped }, null, 2)}\n`,
    'utf8',
  );
  pruneOldSnapshots(userDataPath);

  return { snapshotPath, copied, skipped };
};

export const restoreMissingProtectedData = (userDataPath = app.getPath('userData')): RestoreResult => {
  const restored: string[] = [];
  const skipped: string[] = [];
  const snapshotPaths = listSnapshotPaths(userDataPath);

  for (const entry of protectedDataEntries) {
    const targetPath = join(userDataPath, entry.name);
    if (existsSync(targetPath)) {
      skipped.push(entry.name);
      continue;
    }

    const snapshotPath = snapshotPaths.find((candidate) => existsSync(join(candidate, entry.name)));
    if (!snapshotPath) {
      skipped.push(entry.name);
      continue;
    }

    try {
      copyProtectedEntry(join(snapshotPath, entry.name), targetPath, entry.kind);
      restored.push(entry.name);
    } catch {
      skipped.push(entry.name);
    }
  }

  return { restored, skipped };
};

export const writeDataProtectionManifest = (userDataPath = app.getPath('userData')): void => {
  const protectionPath = getDataProtectionPath(userDataPath);
  const existing = safeReadJson<{ firstProtectedAt?: string }>(join(protectionPath, manifestFileName));
  const now = new Date().toISOString();

  mkdirSync(protectionPath, { recursive: true });
  writeFileSync(
    join(protectionPath, manifestFileName),
    `${JSON.stringify(
      {
        formatVersion: 1,
        appName: typeof app.getName === 'function' ? app.getName() : 'ECHO NEXT',
        appVersion: typeof app.getVersion === 'function' ? app.getVersion() : null,
        protectedUserDataPath: userDataPath,
        protectedEntries: protectedDataEntries.map((entry) => ({ ...entry, path: join(userDataPath, entry.name) })),
        firstProtectedAt: existing?.firstProtectedAt ?? now,
        lastVerifiedAt: now,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
};

export const ensureDataProtection = (reason: DataProtectionReason = 'startup'): { userDataPath: string; migration: LegacyMigrationResult; snapshot: SnapshotResult; restore: RestoreResult } => {
  const userDataPath = initializeProtectedUserDataPath();
  const migration = migrateLegacyProtectedData(userDataPath);
  const restore = restoreMissingProtectedData(userDataPath);
  writeDataProtectionManifest(userDataPath);
  const snapshot = createDataProtectionSnapshot(reason, userDataPath);

  if (migration.migrated.length > 0) {
    console.info(`[data-protection] migrated protected data from ${migration.sourcePath}: ${migration.migrated.map((entry) => basename(entry)).join(', ')}`);
  }

  if (restore.restored.length > 0) {
    console.info(`[data-protection] restored protected data: ${restore.restored.map((entry) => basename(entry)).join(', ')}`);
  }

  return { userDataPath, migration, snapshot, restore };
};
