import { existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import type { LibraryTrack } from '../../shared/types/library';
import type {
  PluginAudioAnalysisEvidence,
  PluginAudioAnalysisReport,
  PluginAudioAnalysisVerdict,
} from '../../shared/types/plugins';
import {
  isDsdCodec,
  isDsdFilePath,
  readDsdNativeSampleRate,
} from './DsdProbe';

type AudioAuthenticityAnalyzerDependencies = {
  now?: () => Date;
  existsSync?: (path: string) => boolean;
  statSync?: typeof statSync;
  readDsdNativeSampleRate?: (filePath: string) => Promise<number | null>;
};

const losslessCodecs = new Set(['flac', 'alac', 'wav', 'wave', 'aiff', 'aif', 'ape']);
const lossyCodecs = new Set(['mp3', 'aac', 'ogg', 'opus', 'vorbis', 'wma']);
const losslessExtensions = new Set(['.flac', '.alac', '.wav', '.wave', '.aiff', '.aif', '.ape']);
const lossyExtensions = new Set(['.mp3', '.aac', '.m4a', '.ogg', '.opus', '.wma']);
const dsdNativeRateFloor = 1_000_000;

const cleanText = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const positiveNumber = (value: unknown): number | null => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const normalizedCodecTokens = (codec: string | null): string[] =>
  (codec ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .filter(Boolean);

const hasCodecToken = (codec: string | null, tokens: Set<string>): boolean =>
  normalizedCodecTokens(codec).some((token) => tokens.has(token));

const evidence = (id: string, severity: PluginAudioAnalysisEvidence['severity'], message: string): PluginAudioAnalysisEvidence => ({
  id,
  severity,
  message,
});

const clampConfidence = (value: number): number =>
  Math.max(0, Math.min(1, Math.round(value * 100) / 100));

export class AudioAuthenticityAnalyzer {
  private readonly now: () => Date;
  private readonly exists: (path: string) => boolean;
  private readonly stat: typeof statSync;
  private readonly readDsdRate: (filePath: string) => Promise<number | null>;

  constructor(dependencies: AudioAuthenticityAnalyzerDependencies = {}) {
    this.now = dependencies.now ?? (() => new Date());
    this.exists = dependencies.existsSync ?? existsSync;
    this.stat = dependencies.statSync ?? statSync;
    this.readDsdRate = dependencies.readDsdNativeSampleRate ?? readDsdNativeSampleRate;
  }

  async analyzeTrack(track: LibraryTrack): Promise<PluginAudioAnalysisReport> {
    const filePath = cleanText(track.path);
    const codec = cleanText(track.codec);
    const extension = filePath ? extname(filePath).toLowerCase() || null : null;
    const sampleRate = positiveNumber(track.sampleRate);
    const bitDepth = positiveNumber(track.bitDepth);
    const bitrate = positiveNumber(track.bitrate);
    const durationSeconds = positiveNumber(track.duration);
    const fileSizeBytes = this.resolveFileSize(filePath);
    const dsdByName = isDsdFilePath(filePath) || isDsdCodec(codec);
    const dsdNativeSampleRate = dsdByName && filePath && this.exists(filePath)
      ? await this.readDsdRate(filePath)
      : null;
    const items: PluginAudioAnalysisEvidence[] = [];
    const limitations: string[] = [
      'This quick report uses host-controlled metadata, file size, and DSD header checks; it does not prove the original mastering source.',
      'Lossy-to-lossless and PCM-to-DSD conclusions remain probabilistic until spectral analysis is added.',
    ];

    if (!filePath) {
      return this.report(track.id, 'unsupported', 'unknown', 0.1, {
        codec,
        extension,
        sampleRate,
        bitDepth,
        bitrate,
        durationSeconds,
        fileSizeBytes,
        dsdNativeSampleRate,
      }, [evidence('track_path_missing', 'warning', 'Track has no local path exposed to the host analyzer.')], limitations);
    }

    if (dsdByName) {
      items.push(evidence('dsd_container_hint', 'info', 'Track is identified as DSF/DFF/DSD by codec or file extension.'));
      if (dsdNativeSampleRate !== null) {
        items.push(evidence('dsd_header_rate', 'info', `DSD header reports native rate ${Math.round(dsdNativeSampleRate)} Hz.`));
      }
      if ((sampleRate !== null && sampleRate < dsdNativeRateFloor) && dsdNativeSampleRate === null) {
        items.push(evidence('dsd_metadata_low_rate', 'risk', 'Track looks like DSD but metadata exposes a PCM-rate sample rate and no native DSD header rate was verified.'));
        return this.report(track.id, 'ready', 'dsd_metadata_mismatch', 0.72, {
          codec,
          extension,
          sampleRate,
          bitDepth,
          bitrate,
          durationSeconds,
          fileSizeBytes,
          dsdNativeSampleRate,
        }, items, limitations);
      }
      return this.report(track.id, 'ready', 'trusted_dsd_container', dsdNativeSampleRate ? 0.82 : 0.62, {
        codec,
        extension,
        sampleRate,
        bitDepth,
        bitrate,
        durationSeconds,
        fileSizeBytes,
        dsdNativeSampleRate,
      }, items, limitations);
    }

    const codecIsLossless = hasCodecToken(codec, losslessCodecs) || (extension !== null && losslessExtensions.has(extension));
    const codecIsLossy = hasCodecToken(codec, lossyCodecs) || (extension !== null && lossyExtensions.has(extension));
    const isHiRes = (sampleRate !== null && sampleRate >= 88_200) || (bitDepth !== null && bitDepth >= 24);
    const longEnoughForBitrateSignal = durationSeconds === null || durationSeconds >= 45;

    if (codecIsLossy) {
      items.push(evidence('lossy_codec', 'info', 'Codec or extension is a known lossy format.'));
      return this.report(track.id, 'ready', 'lossy_source', 0.9, {
        codec,
        extension,
        sampleRate,
        bitDepth,
        bitrate,
        durationSeconds,
        fileSizeBytes,
        dsdNativeSampleRate,
      }, items, limitations);
    }

    if (!codecIsLossless) {
      items.push(evidence('codec_unknown', 'warning', 'Codec is not enough to classify this file as lossless or lossy.'));
      return this.report(track.id, 'ready', 'unknown', 0.3, {
        codec,
        extension,
        sampleRate,
        bitDepth,
        bitrate,
        durationSeconds,
        fileSizeBytes,
        dsdNativeSampleRate,
      }, items, limitations);
    }

    items.push(evidence('lossless_container', 'info', 'Codec or extension is a lossless container.'));
    if (bitrate !== null && longEnoughForBitrateSignal && bitrate < 360_000) {
      items.push(evidence('low_lossless_bitrate', 'risk', 'Average bitrate is unusually low for a normal lossless music file.'));
      return this.report(track.id, 'ready', 'likely_lossy_transcode', 0.68, {
        codec,
        extension,
        sampleRate,
        bitDepth,
        bitrate,
        durationSeconds,
        fileSizeBytes,
        dsdNativeSampleRate,
      }, items, limitations);
    }

    if (isHiRes && bitrate !== null && longEnoughForBitrateSignal && bitrate < 900_000) {
      items.push(evidence('low_hires_bitrate', 'risk', 'Track is marked Hi-Res but has a low average bitrate for 24-bit or high-sample-rate lossless audio.'));
      return this.report(track.id, 'ready', 'likely_fake_hires', 0.64, {
        codec,
        extension,
        sampleRate,
        bitDepth,
        bitrate,
        durationSeconds,
        fileSizeBytes,
        dsdNativeSampleRate,
      }, items, limitations);
    }

    if (sampleRate !== null) {
      items.push(evidence('sample_rate_present', 'info', `Sample rate is ${Math.round(sampleRate)} Hz.`));
    }
    if (bitDepth !== null) {
      items.push(evidence('bit_depth_present', 'info', `Bit depth is ${Math.round(bitDepth)} bit.`));
    }
    if (bitrate !== null) {
      items.push(evidence('bitrate_present', 'info', `Average bitrate is ${Math.round(bitrate)} bps.`));
    }

    return this.report(track.id, 'ready', 'trusted_lossless', isHiRes ? 0.58 : 0.7, {
      codec,
      extension,
      sampleRate,
      bitDepth,
      bitrate,
      durationSeconds,
      fileSizeBytes,
      dsdNativeSampleRate,
    }, items, limitations);
  }

  private resolveFileSize(filePath: string | null): number | null {
    if (!filePath || !this.exists(filePath)) {
      return null;
    }
    try {
      return this.stat(filePath).size;
    } catch {
      return null;
    }
  }

  private report(
    trackId: string,
    status: PluginAudioAnalysisReport['status'],
    verdict: PluginAudioAnalysisVerdict,
    confidence: number,
    metrics: PluginAudioAnalysisReport['metrics'],
    items: PluginAudioAnalysisEvidence[],
    limitations: string[],
  ): PluginAudioAnalysisReport {
    return {
      trackId,
      analyzedAt: this.now().toISOString(),
      status,
      verdict,
      confidence: clampConfidence(confidence),
      metrics,
      evidence: items,
      limitations,
    };
  }
}
