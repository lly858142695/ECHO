import { app, BrowserWindow } from 'electron';
import type { ProcessMetric } from 'electron';
import { IpcChannels } from '../../shared/constants/ipcChannels';
import type {
  DiagnosticMemoryPressureEvent,
  DiagnosticMemoryProcessMetric,
  DiagnosticMemorySnapshot,
} from '../../shared/types/diagnostics';
import { getCrashReportService } from './CrashReportService';

export const memoryPressureThresholdBytes = 3 * 1024 * 1024 * 1024;

const defaultCheckIntervalMs = 30_000;
const initialCheckDelayMs = 10_000;
const topProcessLimit = 15;

let checkTimer: NodeJS.Timeout | null = null;
let initialCheckTimer: NodeJS.Timeout | null = null;
let hasReportedMemoryPressure = false;

const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const kibToBytes = (value: unknown): number => {
  const number = finiteNumber(value);
  return number === null ? 0 : Math.max(0, Math.round(number * 1024));
};

const currentProcessMemorySnapshot = (usage = process.memoryUsage()): DiagnosticMemorySnapshot['currentProcess'] => ({
  pid: process.pid,
  rssBytes: usage.rss,
  heapTotalBytes: usage.heapTotal,
  heapUsedBytes: usage.heapUsed,
  externalBytes: usage.external,
  arrayBuffersBytes: usage.arrayBuffers,
});

const normalizeProcessMetric = (metric: ProcessMetric): DiagnosticMemoryProcessMetric => ({
  pid: metric.pid,
  type: metric.type,
  name: metric.name,
  serviceName: metric.serviceName,
  sandboxed: metric.sandboxed,
  creationTime: metric.creationTime,
  workingSetBytes: kibToBytes(metric.memory?.workingSetSize),
  peakWorkingSetBytes: kibToBytes(metric.memory?.peakWorkingSetSize),
  privateBytes: metric.memory?.privateBytes === undefined ? undefined : kibToBytes(metric.memory.privateBytes),
  cpuPercent: finiteNumber(metric.cpu?.percentCPUUsage) ?? undefined,
});

export const createDiagnosticMemorySnapshot = (
  metrics: ProcessMetric[],
  options: {
    appVersion?: string;
    arch?: string;
    currentProcessMemory?: NodeJS.MemoryUsage;
    platform?: string;
    thresholdBytes?: number;
    timestamp?: string;
  } = {},
): DiagnosticMemorySnapshot => {
  const normalizedMetrics = metrics
    .map(normalizeProcessMetric)
    .sort((left, right) => right.workingSetBytes - left.workingSetBytes);
  const currentProcess = currentProcessMemorySnapshot(options.currentProcessMemory);
  const totalWorkingSetBytes = normalizedMetrics.length > 0
    ? normalizedMetrics.reduce((total, metric) => total + metric.workingSetBytes, 0)
    : currentProcess.rssBytes;
  const privateByteValues = normalizedMetrics
    .map((metric) => metric.privateBytes)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const totalPrivateBytes = privateByteValues.length > 0
    ? privateByteValues.reduce((total, value) => total + value, 0)
    : undefined;

  return {
    timestamp: options.timestamp ?? new Date().toISOString(),
    thresholdBytes: options.thresholdBytes ?? memoryPressureThresholdBytes,
    totalWorkingSetBytes,
    totalPrivateBytes,
    processCount: normalizedMetrics.length || 1,
    source: normalizedMetrics.length > 0 ? 'electron-app-metrics' : 'process-memory-usage',
    currentProcess,
    metrics: normalizedMetrics,
    topProcesses: normalizedMetrics.slice(0, topProcessLimit),
    appVersion: options.appVersion ?? safeAppVersion(),
    platform: options.platform ?? process.platform,
    arch: options.arch ?? process.arch,
  };
};

const safeAppVersion = (): string => {
  try {
    return app.getVersion();
  } catch {
    return 'unknown';
  }
};

const getAppMetricsSnapshot = (): ProcessMetric[] => {
  try {
    return app.getAppMetrics();
  } catch {
    return [];
  }
};

const sendMemoryPressureEvent = (event: DiagnosticMemoryPressureEvent): void => {
  for (const window of BrowserWindow.getAllWindows()) {
    if (window.isDestroyed()) {
      continue;
    }

    const send = (): void => {
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannels.DiagnosticsMemoryPressure, event);
      }
    };

    if (window.webContents.isLoading()) {
      window.webContents.once('did-finish-load', send);
    } else {
      send();
    }
  }
};

export const checkMemoryPressureNow = (): DiagnosticMemoryPressureEvent | null => {
  if (hasReportedMemoryPressure) {
    return null;
  }

  const snapshot = createDiagnosticMemorySnapshot(getAppMetricsSnapshot(), {
    appVersion: safeAppVersion(),
    thresholdBytes: memoryPressureThresholdBytes,
  });

  if (snapshot.totalWorkingSetBytes < snapshot.thresholdBytes) {
    return null;
  }

  try {
    const event = getCrashReportService().reportMemoryPressure(snapshot);
    hasReportedMemoryPressure = true;
    sendMemoryPressureEvent(event);
    return event;
  } catch (error) {
    getCrashReportService().getLogger()?.warn('main', 'failed to create memory pressure report', {
      error: error instanceof Error ? error.message : String(error),
      totalWorkingSetBytes: snapshot.totalWorkingSetBytes,
      thresholdBytes: snapshot.thresholdBytes,
    });
    return null;
  }
};

export const startMemoryPressureMonitor = (): void => {
  if (checkTimer !== null || initialCheckTimer !== null) {
    return;
  }

  hasReportedMemoryPressure = false;
  initialCheckTimer = setTimeout(() => {
    initialCheckTimer = null;
    checkMemoryPressureNow();
  }, initialCheckDelayMs);
  checkTimer = setInterval(checkMemoryPressureNow, defaultCheckIntervalMs);
};

export const stopMemoryPressureMonitor = (): void => {
  if (initialCheckTimer !== null) {
    clearTimeout(initialCheckTimer);
    initialCheckTimer = null;
  }

  if (checkTimer !== null) {
    clearInterval(checkTimer);
    checkTimer = null;
  }
};
