export type DiagnosticScope = 'main' | 'renderer' | 'library' | 'audio' | 'playback' | 'network' | 'crash';

export type DiagnosticLevel = 'debug' | 'info' | 'warn' | 'error';

export type DiagnosticConsoleSource = 'stdout' | 'stderr' | 'renderer' | 'system';

export type DiagnosticConsoleLevel = DiagnosticLevel | 'log';

export type DiagnosticConsoleEntry = {
  id: number;
  timestamp: string;
  source: DiagnosticConsoleSource;
  level: DiagnosticConsoleLevel;
  message: string;
  rawMessage?: string;
  details?: {
    line?: number;
    sourceId?: string;
  };
};

export type DiagnosticConsoleSnapshot = {
  entries: DiagnosticConsoleEntry[];
  maxEntries: number;
};

export type CrashSessionStatus = 'running' | 'closed' | 'abnormalExit';

export type CrashSessionInfo = {
  sessionId: string;
  appVersion: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  startedAt: string;
  shutdownRequestedAt?: string;
  endedAt?: string;
  status: CrashSessionStatus;
};

export type LastCrashSummary = {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  detectedAt: string;
  sessionBasename: string;
  sessionPathHash: string;
  reason: 'abnormalExit';
};

export type RendererErrorPayload = {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  source: 'error' | 'unhandledrejection';
  timestamp: string;
};

export type DiagnosticPerformanceStallPayload = {
  source: 'main' | 'renderer';
  kind: 'event_loop' | 'animation_frame' | 'long_task';
  durationMs: number;
  thresholdMs: number;
  timestamp: string;
  windowKind?: 'main' | 'desktopLyrics' | 'miniPlayer' | 'unknown';
  url?: string;
  details?: Record<string, unknown>;
};

export type DiagnosticMemoryProcessMetric = {
  pid: number;
  type: string;
  name?: string;
  serviceName?: string;
  sandboxed?: boolean;
  creationTime?: number;
  workingSetBytes: number;
  peakWorkingSetBytes: number;
  privateBytes?: number;
  cpuPercent?: number;
};

export type DiagnosticCurrentProcessMemory = {
  pid: number;
  rssBytes: number;
  heapTotalBytes: number;
  heapUsedBytes: number;
  externalBytes: number;
  arrayBuffersBytes: number;
};

export type DiagnosticMemorySnapshot = {
  timestamp: string;
  thresholdBytes: number;
  totalWorkingSetBytes: number;
  totalPrivateBytes?: number;
  processCount: number;
  source: 'electron-app-metrics' | 'process-memory-usage';
  currentProcess: DiagnosticCurrentProcessMemory;
  metrics: DiagnosticMemoryProcessMetric[];
  topProcesses: DiagnosticMemoryProcessMetric[];
  appVersion: string;
  platform: string;
  arch: string;
};

export type DiagnosticMemoryPressureEvent = {
  timestamp: string;
  thresholdBytes: number;
  totalWorkingSetBytes: number;
  totalPrivateBytes?: number;
  processCount: number;
  topProcessType: string;
  topProcessWorkingSetBytes: number;
  reportPath: string;
};
