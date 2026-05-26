import type { DiagnosticPerformanceStallPayload } from '../../shared/types/diagnostics';

const frameStallThresholdMs = 750;
const longTaskThresholdMs = 250;
const reportCooldownMs = 10_000;

let monitorStarted = false;
let lastFrameAt = 0;
let frameId: number | null = null;
const lastReportAtByKind = new Map<DiagnosticPerformanceStallPayload['kind'], number>();

const getWindowKind = (): DiagnosticPerformanceStallPayload['windowKind'] => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('desktopLyrics') === '1') {
    return 'desktopLyrics';
  }
  if (params.get('miniPlayer') === '1') {
    return 'miniPlayer';
  }
  return 'main';
};

const reportStall = (payload: Omit<DiagnosticPerformanceStallPayload, 'source' | 'timestamp' | 'windowKind' | 'url'>): void => {
  const now = Date.now();
  const lastReportAt = lastReportAtByKind.get(payload.kind) ?? 0;
  if (now - lastReportAt < reportCooldownMs) {
    return;
  }

  lastReportAtByKind.set(payload.kind, now);
  void window.echo?.diagnostics.reportPerformanceStall({
    ...payload,
    source: 'renderer',
    timestamp: new Date().toISOString(),
    windowKind: getWindowKind(),
    url: window.location.href,
  }).catch(() => undefined);
};

const scheduleNextFrame = (): void => {
  frameId = window.requestAnimationFrame((timestamp) => {
    if (document.visibilityState === 'visible' && lastFrameAt > 0) {
      const gapMs = timestamp - lastFrameAt;
      if (gapMs >= frameStallThresholdMs) {
        reportStall({
          kind: 'animation_frame',
          durationMs: gapMs,
          thresholdMs: frameStallThresholdMs,
          details: { lastFrameGapMs: gapMs },
        });
      }
    }

    lastFrameAt = timestamp;
    scheduleNextFrame();
  });
};

const startLongTaskObserver = (): void => {
  if (typeof PerformanceObserver !== 'function') {
    return;
  }

  try {
    const supportedTypes = PerformanceObserver.supportedEntryTypes ?? [];
    if (!supportedTypes.includes('longtask')) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration < longTaskThresholdMs) {
          continue;
        }

        reportStall({
          kind: 'long_task',
          durationMs: entry.duration,
          thresholdMs: longTaskThresholdMs,
          details: {
            startTime: entry.startTime,
          },
        });
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // Older Chromium builds can reject longtask observers; frame drift still covers visible stalls.
  }
};

export const startPerformanceStallMonitor = (): void => {
  if (monitorStarted || typeof window === 'undefined' || !window.echo?.diagnostics.reportPerformanceStall) {
    return;
  }

  monitorStarted = true;
  lastFrameAt = performance.now();
  scheduleNextFrame();
  startLongTaskObserver();

  document.addEventListener('visibilitychange', () => {
    lastFrameAt = performance.now();
  });
};

export const stopPerformanceStallMonitorForTests = (): void => {
  if (frameId !== null) {
    window.cancelAnimationFrame(frameId);
    frameId = null;
  }
  monitorStarted = false;
  lastFrameAt = 0;
  lastReportAtByKind.clear();
};
