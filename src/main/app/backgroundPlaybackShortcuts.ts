import { BrowserWindow, globalShortcut } from 'electron';
import { IpcChannels } from '../../shared/constants/ipcChannels';
import {
  globalShortcutActions,
  validateGlobalShortcutAccelerator,
  type GlobalShortcutBinding,
  type GlobalShortcutAction,
  type GlobalShortcutValidationResult,
} from '../../shared/types/globalShortcuts';
import type { AppSettings } from '../../shared/types/appSettings';
import { getAppSettings, setAppSettings } from './appSettings';
import { getMainWindow } from './windowManager';

type RegistrationStatus = {
  action: GlobalShortcutAction;
  accelerator: string | null;
  enabled: boolean;
  registered: boolean;
  error: string | null;
};

let initialized = false;
const registeredAccelerators = new Map<GlobalShortcutAction, string>();
let lastRegistrationStatuses: RegistrationStatus[] = [];

const createStatus = (
  action: GlobalShortcutAction,
  binding: GlobalShortcutBinding | undefined,
  patch: Partial<RegistrationStatus> = {},
): RegistrationStatus => ({
  action,
  accelerator: binding?.accelerator ?? null,
  enabled: binding?.enabled === true,
  registered: false,
  error: null,
  ...patch,
});

const unregisterManagedShortcuts = (): void => {
  for (const accelerator of registeredAccelerators.values()) {
    globalShortcut.unregister(accelerator);
  }

  registeredAccelerators.clear();
};

const getCommandWindow = (): BrowserWindow | null => getMainWindow() ?? BrowserWindow.getAllWindows()[0] ?? null;

const showMainWindow = (): void => {
  const window = getCommandWindow();
  if (!window || window.isDestroyed()) {
    return;
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.show();
  window.focus();
};

const dispatchGlobalShortcutCommand = (action: GlobalShortcutAction): void => {
  if (action === 'showMainWindow') {
    showMainWindow();
    return;
  }

  const window = getCommandWindow();
  if (!window || window.isDestroyed()) {
    return;
  }

  window.webContents.send(IpcChannels.AppGlobalShortcutCommand, action);
};

const registerActionShortcut = (
  action: GlobalShortcutAction,
  accelerator: string,
  binding: GlobalShortcutBinding,
): RegistrationStatus => {
  let registered = false;
  try {
    registered = globalShortcut.register(accelerator, () => dispatchGlobalShortcutCommand(action));
  } catch {
    registered = false;
  }

  if (!registered) {
    return createStatus(action, binding, {
      registered: false,
      error: 'unavailable',
    });
  }

  registeredAccelerators.set(action, accelerator);
  return createStatus(action, binding, { registered: true });
};

const disableUnavailableShortcuts = (settings: AppSettings, failedActions: GlobalShortcutAction[]): AppSettings => {
  if (failedActions.length === 0 || !settings.globalShortcuts) {
    return settings;
  }

  const nextShortcuts = { ...settings.globalShortcuts };
  for (const action of failedActions) {
    nextShortcuts[action] = {
      ...nextShortcuts[action],
      enabled: false,
    };
  }

  return setAppSettings({ globalShortcuts: nextShortcuts });
};

export const refreshBackgroundSpaceRegistration = (): AppSettings | null => {
  unregisterManagedShortcuts();

  const settings = getAppSettings();
  const statuses: RegistrationStatus[] = [];
  const failedActions: GlobalShortcutAction[] = [];

  for (const action of globalShortcutActions) {
    const binding = settings.globalShortcuts?.[action];
    if (!binding?.enabled || !binding.accelerator) {
      statuses.push(createStatus(action, binding));
      continue;
    }

    const validation = validateGlobalShortcutAccelerator(binding.accelerator);
    if (!validation.valid || !validation.accelerator) {
      statuses.push(createStatus(action, binding, { error: validation.reason }));
      failedActions.push(action);
      continue;
    }

    const status = registerActionShortcut(action, validation.accelerator, binding);
    statuses.push(status);
    if (!status.registered) {
      failedActions.push(action);
    }
  }

  lastRegistrationStatuses = statuses;

  if (failedActions.length === 0) {
    return null;
  }

  const nextSettings = disableUnavailableShortcuts(settings, failedActions);
  unregisterManagedShortcuts();

  for (const action of globalShortcutActions) {
    const binding = nextSettings.globalShortcuts?.[action];
    if (binding?.enabled && binding.accelerator) {
      const validation = validateGlobalShortcutAccelerator(binding.accelerator);
      if (validation.valid && validation.accelerator) {
        const status = registerActionShortcut(action, validation.accelerator, binding);
        const statusIndex = lastRegistrationStatuses.findIndex((item) => item.action === action);
        if (statusIndex >= 0) {
          lastRegistrationStatuses[statusIndex] = status;
        }
      }
    }
  }

  return nextSettings;
};

export const initializeBackgroundPlaybackShortcuts = (): void => {
  if (initialized) {
    return;
  }

  initialized = true;
  refreshBackgroundSpaceRegistration();
};

export const bindBackgroundPlaybackShortcutsToWindow = (): void => {
  if (initialized) {
    refreshBackgroundSpaceRegistration();
  }
};

export const disposeBackgroundPlaybackShortcuts = (): void => {
  unregisterManagedShortcuts();
  lastRegistrationStatuses = [];
};

export const validateGlobalShortcut = (accelerator: unknown): GlobalShortcutValidationResult => {
  const validation = validateGlobalShortcutAccelerator(accelerator);
  if (!validation.valid || !validation.accelerator) {
    return validation;
  }

  if (globalShortcut.isRegistered(validation.accelerator)) {
    return validation;
  }

  let available = false;
  try {
    available = globalShortcut.register(validation.accelerator, () => undefined);
  } catch {
    available = false;
  }

  if (available) {
    globalShortcut.unregister(validation.accelerator);
    return validation;
  }

  return {
    ...validation,
    available: false,
    reason: 'unavailable',
  };
};

export const getGlobalShortcutRegistrationStatuses = (): RegistrationStatus[] => lastRegistrationStatuses;
