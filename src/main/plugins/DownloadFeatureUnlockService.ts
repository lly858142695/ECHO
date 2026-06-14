import {
  downloadFeatureUnlockFeatureId,
  downloadFeatureUnlockPluginId,
  downloadFeatureUnlockVersion,
  type DownloadFeatureUnlockReason,
  type DownloadFeatureUnlockStatus,
} from '../../shared/constants/featureUnlocks';
import { getPluginService } from './PluginService';

const nowIso = (): string => new Date().toISOString();

export class DownloadFeatureUnlockService {
  getStatus(): DownloadFeatureUnlockStatus {
    const checkedAt = nowIso();
    const plugin = getPluginService().list().plugins.find((item) => item.id === downloadFeatureUnlockPluginId) ?? null;
    const baseStatus = {
      featureId: downloadFeatureUnlockFeatureId,
      pluginId: downloadFeatureUnlockPluginId,
      requiredVersion: downloadFeatureUnlockVersion,
      checkedAt,
      pluginInstalled: Boolean(plugin),
      pluginEnabled: plugin?.enabled === true && plugin.disabledByHost !== true && plugin.status !== 'disabled',
    } satisfies Omit<DownloadFeatureUnlockStatus, 'reason' | 'unlocked'>;

    if (!plugin) {
      return this.finishStatus(baseStatus, false, 'plugin-missing');
    }
    if (plugin.error || plugin.disabledByHost === true) {
      return this.finishStatus(baseStatus, false, 'plugin-error');
    }
    if (!baseStatus.pluginEnabled) {
      return this.finishStatus(baseStatus, false, 'plugin-disabled');
    }

    return this.finishStatus(baseStatus, true, 'unlocked');
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
