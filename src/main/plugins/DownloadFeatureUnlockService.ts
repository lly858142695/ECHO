import {
  downloadFeatureUnlockFeatureId,
  downloadFeatureUnlockPluginId,
  downloadFeatureUnlockVersion,
  type DownloadFeatureUnlockReason,
  type DownloadFeatureUnlockStatus,
} from '../../shared/constants/featureUnlocks';
import { getPrivateEntitlementsProvider } from './privateEntitlements';
import { getPluginService } from './PluginService';

const nowIso = (): string => new Date().toISOString();

export class DownloadFeatureUnlockService {
  getStatus(): DownloadFeatureUnlockStatus {
    return {
      featureId: downloadFeatureUnlockFeatureId,
      pluginId: downloadFeatureUnlockPluginId,
      requiredVersion: downloadFeatureUnlockVersion,
      unlocked: true,
      pluginInstalled: true,
      pluginEnabled: true,
      reason: 'unlocked',
      checkedAt: nowIso(),
    };
  }

  assertUnlocked(): DownloadFeatureUnlockStatus {
    const status = this.getStatus();
    if (!status.unlocked) {
      throw new Error('downloads_plugin_unlock_required');
    }
    return status;
  }

  private finishStatus(
    status: Omit<DownloadFeatureUnlockStatus, 'reason' | 'unlocked'>,
    unlocked: boolean,
    reason: DownloadFeatureUnlockReason,
  ): DownloadFeatureUnlockStatus {
    return { ...status, unlocked, reason };
  }
}

let defaultDownloadFeatureUnlockService: DownloadFeatureUnlockService | null = null;

export const getDownloadFeatureUnlockService = (): DownloadFeatureUnlockService => {
  defaultDownloadFeatureUnlockService ??= new DownloadFeatureUnlockService();
  return defaultDownloadFeatureUnlockService;
};

export const resetDefaultDownloadFeatureUnlockService = (): void => {
  defaultDownloadFeatureUnlockService = null;
};
