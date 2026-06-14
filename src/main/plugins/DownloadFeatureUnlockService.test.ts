import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadFeatureUnlockPluginId } from '../../shared/constants/featureUnlocks';

const mocks = vi.hoisted(() => ({
  plugins: [] as Array<{
    id: string;
    enabled: boolean;
    disabledByHost: boolean;
    status: string;
    error: string | null;
  }>,
}));

vi.mock('./PluginService', () => ({
  getPluginService: () => ({
    list: () => ({ directory: 'D:\\Echo\\plugins', plugins: mocks.plugins }),
  }),
}));

describe('DownloadFeatureUnlockService', () => {
  beforeEach(() => {
    mocks.plugins = [];
    vi.resetModules();
  });

  it('blocks when the downloads unlock plugin is missing', async () => {
    const { DownloadFeatureUnlockService } = await import('./DownloadFeatureUnlockService');
    const service = new DownloadFeatureUnlockService();

    const status = service.getStatus();

    expect(status).toMatchObject({
      unlocked: false,
      pluginInstalled: false,
      pluginEnabled: false,
      reason: 'plugin-missing',
    });
  });

  it('unlocks when the downloads unlock plugin is enabled and healthy', async () => {
    mocks.plugins = [{
      id: downloadFeatureUnlockPluginId,
      enabled: true,
      disabledByHost: false,
      status: 'running',
      error: null,
    }];
    const { DownloadFeatureUnlockService } = await import('./DownloadFeatureUnlockService');
    const service = new DownloadFeatureUnlockService();

    const status = service.getStatus();

    expect(status).toMatchObject({
      unlocked: true,
      pluginInstalled: true,
      pluginEnabled: true,
      reason: 'unlocked',
    });
  });

  it('blocks when the downloads unlock plugin is disabled or isolated', async () => {
    mocks.plugins = [{
      id: downloadFeatureUnlockPluginId,
      enabled: false,
      disabledByHost: false,
      status: 'disabled',
      error: null,
    }];
    const { DownloadFeatureUnlockService } = await import('./DownloadFeatureUnlockService');
    const service = new DownloadFeatureUnlockService();

    expect(service.getStatus()).toMatchObject({ unlocked: false, reason: 'plugin-disabled' });

    mocks.plugins = [{
      id: downloadFeatureUnlockPluginId,
      enabled: true,
      disabledByHost: true,
      status: 'error',
      error: 'boom',
    }];

    expect(service.getStatus()).toMatchObject({ unlocked: false, reason: 'plugin-error' });
  });
});
