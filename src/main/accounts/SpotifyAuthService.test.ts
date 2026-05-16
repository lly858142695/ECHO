import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountService } from './AccountService';
import { SpotifyAuthService } from './SpotifyAuthService';

const { openExternal } = vi.hoisted(() => ({
  openExternal: vi.fn(async () => undefined),
}));
const tempDirs: string[] = [];

vi.mock('electron', () => ({
  app: {
    getPath: () => process.cwd(),
  },
  BrowserWindow: vi.fn(),
  shell: {
    openExternal,
  },
}));

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const createSpotifyService = (): SpotifyAuthService => {
  const dir = mkdtempSync(join(tmpdir(), 'echo-spotify-auth-'));
  tempDirs.push(dir);
  const accountService = new AccountService(join(dir, 'accounts.json'));
  accountService.saveSpotifyTokens({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    tokenType: 'Bearer',
    scope: 'streaming user-read-playback-state user-modify-playback-state',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    username: 'spotify-user',
    displayName: 'Spotify User',
    avatarUrl: null,
  });
  return new SpotifyAuthService(accountService);
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  openExternal.mockClear();
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('SpotifyAuthService ensureConnectDevice', () => {
  it('uses an existing Spotify Connect device without opening external players', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      devices: [
        {
          id: 'device-1',
          name: 'Spotify Desktop',
          type: 'Computer',
          is_active: true,
          is_restricted: false,
          volume_percent: 42,
        },
      ],
    })));

    const result = await createSpotifyService().ensureConnectDevice({
      uri: 'spotify:track:abc123',
      webUrl: 'https://open.spotify.com/track/abc123',
    });

    expect(result).toMatchObject({
      deviceId: 'device-1',
      deviceName: 'Spotify Desktop',
      launched: 'none',
    });
    expect(openExternal).not.toHaveBeenCalled();
  });

  it('opens desktop first, then web player, and resolves when a device appears', async () => {
    vi.useFakeTimers();
    let deviceCalls = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      deviceCalls += 1;
      return jsonResponse({
        devices: deviceCalls >= 11
          ? [
              {
                id: 'device-web',
                name: 'Spotify Web Player',
                type: 'Computer',
                is_active: false,
                is_restricted: false,
                volume_percent: null,
              },
            ]
          : [],
      });
    }));

    const promise = createSpotifyService().ensureConnectDevice({
      uri: 'spotify:track:abc123',
      webUrl: 'https://open.spotify.com/track/abc123',
    });

    await vi.advanceTimersByTimeAsync(10_000);
    const result = await promise;

    expect(openExternal).toHaveBeenNthCalledWith(1, 'spotify:');
    expect(openExternal).toHaveBeenNthCalledWith(2, 'https://open.spotify.com/track/abc123');
    expect(result).toMatchObject({
      deviceId: 'device-web',
      deviceName: 'Spotify Web Player',
      launched: 'web',
    });
  });
});
