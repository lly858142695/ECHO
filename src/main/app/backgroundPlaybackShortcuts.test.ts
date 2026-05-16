import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSettings } from '../../shared/types/appSettings';
import { createDefaultGlobalShortcuts } from '../../shared/types/globalShortcuts';
import { IpcChannels } from '../../shared/constants/ipcChannels';

const callbacks = new Map<string, () => void>();
const unavailableAccelerators = new Set<string>();
const registerMock = vi.fn((accelerator: string, callback: () => void) => {
  if (unavailableAccelerators.has(accelerator)) {
    return false;
  }

  callbacks.set(accelerator, callback);
  return true;
});
const unregisterMock = vi.fn((accelerator: string) => {
  callbacks.delete(accelerator);
});
const isRegisteredMock = vi.fn((accelerator: string) => callbacks.has(accelerator));
const sendMock = vi.fn();
const showMock = vi.fn();
const focusMock = vi.fn();
const restoreMock = vi.fn();
let minimized = false;
let destroyed = false;
let currentSettings: AppSettings;
const setAppSettingsMock = vi.fn((patch: Partial<AppSettings>) => {
  currentSettings = {
    ...currentSettings,
    ...patch,
  };
  return currentSettings;
});

const createSettings = (settings: Partial<AppSettings> = {}): AppSettings =>
  ({
    globalShortcuts: createDefaultGlobalShortcuts(),
    ...settings,
  }) as AppSettings;

vi.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: () => [
      {
        focus: focusMock,
        isDestroyed: () => destroyed,
        isMinimized: () => minimized,
        restore: restoreMock,
        show: showMock,
        webContents: {
          send: sendMock,
        },
      },
    ],
  },
  globalShortcut: {
    isRegistered: isRegisteredMock,
    register: registerMock,
    unregister: unregisterMock,
  },
}));

vi.mock('./appSettings', () => ({
  getAppSettings: () => currentSettings,
  setAppSettings: setAppSettingsMock,
}));

vi.mock('./windowManager', () => ({
  getMainWindow: () => null,
}));

describe('global playback shortcuts', () => {
  beforeEach(() => {
    vi.resetModules();
    callbacks.clear();
    unavailableAccelerators.clear();
    registerMock.mockClear();
    unregisterMock.mockClear();
    isRegisteredMock.mockClear();
    sendMock.mockClear();
    showMock.mockClear();
    focusMock.mockClear();
    restoreMock.mockClear();
    setAppSettingsMock.mockClear();
    minimized = false;
    destroyed = false;
    currentSettings = createSettings();
  });

  it('registers enabled shortcuts and sends renderer commands', async () => {
    currentSettings = createSettings({
      globalShortcuts: {
        ...createDefaultGlobalShortcuts(),
        playPause: { enabled: true, accelerator: 'Ctrl+Alt+Space' },
      },
    });
    const shortcuts = await import('./backgroundPlaybackShortcuts');

    shortcuts.refreshBackgroundSpaceRegistration();
    callbacks.get('Ctrl+Alt+Space')?.();

    expect(registerMock).toHaveBeenCalledWith('Ctrl+Alt+Space', expect.any(Function));
    expect(sendMock).toHaveBeenCalledWith(IpcChannels.AppGlobalShortcutCommand, 'playPause');
  });

  it('disables enabled shortcuts when Electron cannot register them', async () => {
    currentSettings = createSettings({
      globalShortcuts: {
        ...createDefaultGlobalShortcuts(),
        playPause: { enabled: true, accelerator: 'Ctrl+Alt+Space' },
      },
    });
    unavailableAccelerators.add('Ctrl+Alt+Space');
    const shortcuts = await import('./backgroundPlaybackShortcuts');

    const nextSettings = shortcuts.refreshBackgroundSpaceRegistration();

    expect(nextSettings?.globalShortcuts?.playPause.enabled).toBe(false);
    expect(setAppSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        globalShortcuts: expect.objectContaining({
          playPause: { enabled: false, accelerator: 'Ctrl+Alt+Space' },
        }),
      }),
    );
  });

  it('treats Electron accelerator parser throws as unavailable', async () => {
    currentSettings = createSettings({
      globalShortcuts: {
        ...createDefaultGlobalShortcuts(),
        nextTrack: { enabled: true, accelerator: 'MouseButton4' },
      },
    });
    registerMock.mockImplementationOnce(() => {
      throw new Error('invalid accelerator');
    });
    const shortcuts = await import('./backgroundPlaybackShortcuts');

    const nextSettings = shortcuts.refreshBackgroundSpaceRegistration();

    expect(nextSettings?.globalShortcuts?.nextTrack.enabled).toBe(false);
    expect(setAppSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        globalShortcuts: expect.objectContaining({
          nextTrack: { enabled: false, accelerator: 'MouseButton4' },
        }),
      }),
    );
  });

  it('returns unavailable when validation registration throws', async () => {
    registerMock.mockImplementationOnce(() => {
      throw new Error('invalid accelerator');
    });
    const shortcuts = await import('./backgroundPlaybackShortcuts');

    expect(shortcuts.validateGlobalShortcut('MouseButton4')).toEqual({
      accelerator: 'MouseButton4',
      available: false,
      reason: 'unavailable',
      valid: true,
    });
  });

  it('shows the main window directly for showMainWindow', async () => {
    currentSettings = createSettings({
      globalShortcuts: {
        ...createDefaultGlobalShortcuts(),
        showMainWindow: { enabled: true, accelerator: 'Ctrl+Alt+E' },
      },
    });
    minimized = true;
    const shortcuts = await import('./backgroundPlaybackShortcuts');

    shortcuts.refreshBackgroundSpaceRegistration();
    callbacks.get('Ctrl+Alt+E')?.();

    expect(restoreMock).toHaveBeenCalledTimes(1);
    expect(showMock).toHaveBeenCalledTimes(1);
    expect(focusMock).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('unregisters managed shortcuts on dispose', async () => {
    currentSettings = createSettings({
      globalShortcuts: {
        ...createDefaultGlobalShortcuts(),
        nextTrack: { enabled: true, accelerator: 'Ctrl+Alt+Right' },
      },
    });
    const shortcuts = await import('./backgroundPlaybackShortcuts');

    shortcuts.refreshBackgroundSpaceRegistration();
    shortcuts.disposeBackgroundPlaybackShortcuts();

    expect(unregisterMock).toHaveBeenCalledWith('Ctrl+Alt+Right');
  });
});
