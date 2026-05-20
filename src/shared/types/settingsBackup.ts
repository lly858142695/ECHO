import type { AppSettings } from './appSettings';

export type SettingsBackupPayload = {
  format: 'echo-next-settings-backup';
  version: 1;
  exportedAt: string;
  appVersion: string;
  settings: AppSettings;
};

export type SettingsImportResult = {
  settings: AppSettings;
  backupPath: string;
  importedPath: string;
  warnings: string[];
};

export type DataPackageExportResult = {
  filePath: string;
  exportedAt: string;
  snapshotPath: string;
  includedEntries: string[];
  skippedEntries: string[];
  warnings: string[];
};
