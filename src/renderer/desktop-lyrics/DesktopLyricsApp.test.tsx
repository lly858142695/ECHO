// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ConnectSessionStatus } from '../../shared/types/connect';
import {
  DesktopLyricsApp,
  getInterpolatedPositionMs,
  getDesktopLyricsTextFitScale,
  hqPlayerConnectStatusToDesktopLyricsClock,
  shouldShowDesktopLyricsText,
} from './DesktopLyricsApp';

const makeDesktopLyricsSettings = (locked: boolean) => ({
  desktopLyricsEnabled: true,
  desktopLyricsLocked: locked,
  desktopLyricsFontSizePx: 34,
  desktopLyricsScalePercent: 100,
  desktopLyricsFontFamily: 'Microsoft YaHei',
  desktopLyricsFontFilePath: null,
  desktopLyricsColor: '#FFFFFF',
  desktopLyricsStrokeColor: '#111827',
  desktopLyricsOpacityPercent: 96,
  desktopLyricsRomanizationEnabled: true,
  desktopLyricsTranslationEnabled: true,
  desktopLyricsBounds: null,
});

const renderDesktopLyricsApp = (locked: boolean): { setMousePassthrough: ReturnType<typeof vi.fn> } => {
  const settings = makeDesktopLyricsSettings(locked);
  const setMousePassthrough = vi.fn();

  window.echo = {
    app: {
      getSettings: vi.fn().mockResolvedValue(settings),
      loadFontFile: vi.fn(),
    },
    connect: {
      getStatus: vi.fn().mockResolvedValue(null),
      onStatus: vi.fn(() => () => undefined),
    },
    desktopLyrics: {
      getLastAudioStatus: vi.fn().mockResolvedValue(null),
      getState: vi.fn().mockResolvedValue({
        visible: true,
        locked,
        bounds: null,
        settings,
      }),
      onAudioStatus: vi.fn(() => () => undefined),
      onStateChanged: vi.fn(() => () => undefined),
      setMousePassthrough,
    },
    playback: {
      getStatus: vi.fn().mockResolvedValue({
        currentTrackId: null,
        filePath: null,
        state: 'stopped',
        positionMs: 0,
        durationMs: 0,
      }),
    },
  } as unknown as typeof window.echo;

  render(<DesktopLyricsApp />);

  return { setMousePassthrough };
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.echo = undefined;
});

describe('desktop lyrics text fitting', () => {
  it('hides text that would overflow the desktop lyrics window', () => {
    expect(shouldShowDesktopLyricsText({
      text: '短歌词',
      availableWidthPx: 320,
      fontSizePx: 34,
      fontFamily: '"Microsoft YaHei", sans-serif',
      fontWeight: 700,
      scalePercent: 100,
    })).toBe(true);

    expect(shouldShowDesktopLyricsText({
      text: 'これはとてもとてもとてもとても長いデスクトップ歌詞です',
      availableWidthPx: 320,
      fontSizePx: 34,
      fontFamily: '"Microsoft YaHei", sans-serif',
      fontWeight: 700,
      scalePercent: 100,
    })).toBe(false);
  });

  it('shrinks long primary lyrics instead of requiring them to be hidden', () => {
    expect(getDesktopLyricsTextFitScale({
      text: 'Short lyric',
      availableWidthPx: 320,
      fontSizePx: 34,
      fontFamily: '"Microsoft YaHei", sans-serif',
      fontWeight: 700,
      scalePercent: 100,
    })).toBe(1);

    const fitScale = getDesktopLyricsTextFitScale({
      text: 'Wonderland '.repeat(10),
      availableWidthPx: 320,
      fontSizePx: 34,
      fontFamily: '"Microsoft YaHei", sans-serif',
      fontWeight: 700,
      scalePercent: 100,
    });

    expect(fitScale).toBeGreaterThanOrEqual(0.62);
    expect(fitScale).toBeLessThan(1);
  });

  it('uses HQPlayer Connect status as a desktop lyrics clock', () => {
    const clock = hqPlayerConnectStatusToDesktopLyricsClock({
      deviceId: 'hqplayer:local-desktop',
      protocol: 'hqplayer',
      state: 'playing',
      currentTrackId: 'track-hq',
      metadata: {
        title: 'HQ Track',
        artist: 'Artist',
        album: null,
        albumArtist: null,
        durationSeconds: 180,
        coverHttpUrl: '',
      },
      positionSeconds: 12.5,
      durationSeconds: 180,
      latencyMs: null,
      error: null,
      updatedAt: '2026-05-25T00:00:00.000Z',
    } satisfies ConnectSessionStatus, 1234);

    expect(clock).toMatchObject({
      currentTrackId: 'track-hq',
      filePath: null,
      state: 'playing',
      positionMs: 12500,
      durationMs: 180000,
      playbackRate: 1,
      updatedAtMs: 1234,
    });
  });

  it('holds forwarded desktop lyrics clock when native position telemetry is stale', () => {
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(2000);

    try {
      expect(getInterpolatedPositionMs({
        source: 'forwarded',
        currentTrackId: 'track-1',
        filePath: 'C:\\Music\\track.flac',
        state: 'playing',
        positionMs: 8900,
        durationMs: 180000,
        playbackRate: 1,
        updatedAtMs: 0,
        nativePositionStalenessMs: 1200,
        nativeBufferedMs: 240,
        nativeUnderrunCallbacks: 0,
      })).toBe(8900);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('holds forwarded desktop lyrics clock after underrun with low buffer', () => {
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(2000);

    try {
      expect(getInterpolatedPositionMs({
        source: 'forwarded',
        currentTrackId: 'track-1',
        filePath: 'C:\\Music\\track.flac',
        state: 'playing',
        positionMs: 8900,
        durationMs: 180000,
        playbackRate: 1,
        updatedAtMs: 0,
        nativePositionStalenessMs: 0,
        nativeBufferedMs: 12,
        nativeUnderrunCallbacks: 1,
      })).toBe(8900);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('keeps interpolating desktop lyrics when playback telemetry is healthy', () => {
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(2000);

    try {
      expect(getInterpolatedPositionMs({
        source: 'forwarded',
        currentTrackId: 'track-1',
        filePath: 'C:\\Music\\track.flac',
        state: 'playing',
        positionMs: 8900,
        durationMs: 180000,
        playbackRate: 1,
        updatedAtMs: 0,
        nativePositionStalenessMs: 20,
        nativeBufferedMs: 240,
        nativeUnderrunCallbacks: 0,
      })).toBe(10900);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('keeps mouse passthrough enabled when locked even after mouse movement', async () => {
    const { setMousePassthrough } = renderDesktopLyricsApp(true);

    await waitFor(() => expect(setMousePassthrough).toHaveBeenCalledWith(true));
    setMousePassthrough.mockClear();

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));

    expect(setMousePassthrough).not.toHaveBeenCalledWith(false);
  });
});
