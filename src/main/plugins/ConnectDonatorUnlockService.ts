import type { ConnectDonatorUnlockStatus } from '../../shared/constants/featureUnlocks';
import {
  createPrivateFeatureError,
  getDefaultConnectDonatorUnlockStatus,
  getPrivateEntitlementsProvider,
} from './privateEntitlements';
import { getPluginService } from './PluginService';

export class ConnectDonatorUnlockService {
  constructor(_userDataPath?: string) {}

  getStatus(): ConnectDonatorUnlockStatus {
    return {
      featureId: 'connect',
      pluginId: 'echo.connect-donator-unlock',
      requiredVersion: 'plugin:echo.connect-donator-unlock:v1',
      unlocked: true,
      pluginInstalled: true,
      pluginEnabled: true,
      hwidHash: '',
      reason: 'unlocked',
      checkedAt: new Date().toISOString(),
    };
  }

  async refreshStatus(): Promise<ConnectDonatorUnlockStatus> {
    return this.getStatus();
  }

  assertUnlocked(): ConnectDonatorUnlockStatus {
    return this.getStatus();
  }

  close(): void {}
}

let defaultConnectDonatorUnlockService: ConnectDonatorUnlockService | null = null;

export const getConnectDonatorUnlockService = (): ConnectDonatorUnlockService => {
  defaultConnectDonatorUnlockService ??= new ConnectDonatorUnlockService();
  return defaultConnectDonatorUnlockService;
};

export const closeDefaultConnectDonatorUnlockService = (): void => {
  defaultConnectDonatorUnlockService?.close();
  defaultConnectDonatorUnlockService = null;
};
