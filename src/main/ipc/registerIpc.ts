import { existsSync, readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import { IpcChannels } from '../../shared/constants/ipcChannels';
import type { AppSettings } from '../../shared/types/appSettings';
import type { FontFileAsset } from '../../preload/apiTypes';
import { getAppSettings, setAppSettings } from '../app/appSettings';
import { destroyTray, ensureTray } from '../app/tray';
import { registerAudioIpc } from './audioIpc';
import { registerLibraryIpc } from './libraryIpc';
import { registerPlaybackIpc } from './playbackIpc';

const fontMimeTypes: Record<string, string> = {
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const requireFontPath = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('font path must be a non-empty string');
  }

  const fontPath = value.trim();
  const extension = extname(fontPath).toLowerCase();

  if (!fontMimeTypes[extension]) {
    throw new Error('selected file is not a supported font');
  }

  if (!existsSync(fontPath)) {
    throw new Error('selected font file does not exist');
  }

  return fontPath;
};

const toFontFamily = (fontPath: string): string => basename(fontPath, extname(fontPath)).replace(/[\r\n;]/g, '').trim() || 'Custom Font';

const loadFontFile = (fontPathInput: unknown): FontFileAsset => {
  const fontPath = requireFontPath(fontPathInput);
  const extension = extname(fontPath).toLowerCase();
  const content = readFileSync(fontPath);

  return {
    path: fontPath,
    family: toFontFamily(fontPath),
    dataUrl: `data:${fontMimeTypes[extension]};base64,${content.toString('base64')}`,
  };
};

export const registerIpc = (): void => {
  ipcMain.handle(IpcChannels.AppGetVersion, () => app.getVersion());
  ipcMain.handle(IpcChannels.AppWindowMinimize, (event: IpcMainInvokeEvent): void => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  ipcMain.handle(IpcChannels.AppWindowToggleMaximize, (event: IpcMainInvokeEvent): void => {
    const window = BrowserWindow.fromWebContents(event.sender);

    if (!window) {
      return;
    }

    if (window.isMaximized()) {
      window.unmaximize();
      return;
    }

    window.maximize();
  });
  ipcMain.handle(IpcChannels.AppWindowClose, (event: IpcMainInvokeEvent): void => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });
  ipcMain.handle(IpcChannels.AppGetSettings, (): AppSettings => getAppSettings());
  ipcMain.handle(IpcChannels.AppSetSettings, (_event: IpcMainInvokeEvent, patch: Partial<AppSettings>): AppSettings => {
    const settings = setAppSettings(patch);

    if (settings.hideToTrayOnClose) {
      ensureTray();
    } else {
      destroyTray();
    }

    return settings;
  });
  ipcMain.handle(IpcChannels.AppChooseFontFile, async (): Promise<FontFileAsset | null> => {
    const result = await dialog.showOpenDialog({
      title: 'Choose font file',
      properties: ['openFile'],
      filters: [{ name: 'Font files', extensions: ['ttf', 'otf', 'woff', 'woff2'] }],
    });

    return result.canceled ? null : loadFontFile(result.filePaths[0]);
  });
  ipcMain.handle(IpcChannels.AppLoadFontFile, (_event: IpcMainInvokeEvent, fontPath: unknown): FontFileAsset => loadFontFile(fontPath));

  registerLibraryIpc();
  registerPlaybackIpc();
  registerAudioIpc();
};
