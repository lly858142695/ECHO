import { app } from 'electron';
import { createMainWindow } from './createMainWindow';
import { getMainWindow } from './windowManager';
import { registerCoverProtocolHandler } from '../protocol/coverProtocol';

export const registerAppLifecycle = (): void => {
  app.whenReady().then(() => {
    registerCoverProtocolHandler();
    createMainWindow();

    app.on('activate', () => {
      if (getMainWindow() === null) {
        createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
};
