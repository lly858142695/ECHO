import { BrowserWindow, globalShortcut } from 'electron';
import { getAppSettings } from './appSettings';
import { getAudioSession } from '../audio/AudioSession';
import { syncSmtcStatus } from '../integrations/smtc/SmtcStatusSync';
import { savePlaybackMemoryNow } from '../ipc/playbackIpc';

const backgroundPauseAccelerator = 'Space';

let initialized = false;
let registered = false;
const boundWindows = new WeakSet<BrowserWindow>();

const shouldCaptureBackgroundSpace = (): boolean => {
  if (getAppSettings().backgroundSpacePauseEnabled !== true) {
    return false;
  }

  const status = getAudioSession().getStatus();
  const focusedWindow = BrowserWindow.getFocusedWindow();

  return status.state === 'playing' && !focusedWindow;
};

const unregisterBackgroundSpace = (): void => {
  if (!registered) {
    return;
  }

  globalShortcut.unregister(backgroundPauseAccelerator);
  registered = false;
};

const registerBackgroundSpace = (): void => {
  if (registered || !shouldCaptureBackgroundSpace()) {
    return;
  }

  registered = globalShortcut.register(backgroundPauseAccelerator, () => {
    if (!shouldCaptureBackgroundSpace()) {
      unregisterBackgroundSpace();
      return;
    }

    getAudioSession().pause();
    savePlaybackMemoryNow();
    void syncSmtcStatus();
    unregisterBackgroundSpace();
  });
};

export const refreshBackgroundSpaceRegistration = (): void => {
  if (shouldCaptureBackgroundSpace()) {
    registerBackgroundSpace();
    return;
  }

  unregisterBackgroundSpace();
};

export const initializeBackgroundPlaybackShortcuts = (): void => {
  if (initialized) {
    return;
  }

  initialized = true;
  getAudioSession().on('status', refreshBackgroundSpaceRegistration);

  BrowserWindow.getAllWindows().forEach(bindBackgroundPlaybackShortcutsToWindow);

  refreshBackgroundSpaceRegistration();
};

export const bindBackgroundPlaybackShortcutsToWindow = (window: BrowserWindow): void => {
  if (boundWindows.has(window)) {
    return;
  }

  boundWindows.add(window);
  window.on('focus', refreshBackgroundSpaceRegistration);
  window.on('blur', refreshBackgroundSpaceRegistration);
  window.on('closed', refreshBackgroundSpaceRegistration);
  refreshBackgroundSpaceRegistration();
};

export const disposeBackgroundPlaybackShortcuts = (): void => {
  unregisterBackgroundSpace();
};
