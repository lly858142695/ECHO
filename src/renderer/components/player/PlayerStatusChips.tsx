import type { AudioStatus } from '../../../shared/types/audio';
import type { LibraryTrack } from '../../../shared/types/library';

type PlayerStatusChipsProps = {
  status: AudioStatus | null;
  state: string;
  track: LibraryTrack | null;
};

type Chip = {
  label: string;
  className: string;
};

const formatSpecRate = (value: number | null | undefined): string | null => {
  if (!value || !Number.isFinite(value)) {
    return null;
  }

  if (value < 1000) {
    return `${Math.round(value)}Hz`;
  }

  const khz = value / 1000;
  return `${Number.isInteger(khz) ? Math.round(khz) : khz.toFixed(1)}kHz`;
};

const channelLabel = (channels: number | null | undefined): string | null => {
  if (!channels || !Number.isFinite(channels)) {
    return null;
  }

  if (channels === 1) {
    return 'Mono';
  }

  if (channels === 2) {
    return 'Stereo';
  }

  return `${channels}ch`;
};

const codecClassName = (codec: string): string => {
  if (codec === 'FLAC' || codec === 'ALAC' || codec === 'DSF' || codec === 'DFF') {
    return 'tag-flac';
  }

  return 'tag-lossless';
};

export const PlayerStatusChips = ({ status, state, track }: PlayerStatusChipsProps): JSX.Element => {
  const codec = (track?.codec ?? status?.codec)?.toUpperCase() ?? null;
  const bitDepth = track?.bitDepth ?? status?.bitDepth ?? null;
  const sampleRate = track?.sampleRate ?? status?.fileSampleRate ?? null;
  const bitrate = track?.bitrate ?? null;
  const channels = channelLabel(status?.channels);
  const formattedRate = formatSpecRate(sampleRate);
  const chips: Chip[] = [
    status?.sampleRateMismatch ? { label: 'Rate Mismatch', className: 'tag-warning' } : null,
    codec ? { label: codec, className: codecClassName(codec) } : null,
    bitDepth && sampleRate && (bitDepth >= 24 || sampleRate >= 88200) ? { label: 'Hi-Res', className: 'tag-hires' } : null,
    bitDepth && formattedRate ? { label: `${bitDepth}bit / ${formattedRate}`, className: 'tag-depth' } : null,
    !bitDepth && formattedRate ? { label: formattedRate, className: 'tag-depth' } : null,
    bitrate ? { label: `${Math.round(bitrate / 1000)}kbps`, className: 'tag-bitrate' } : null,
    channels ? { label: channels, className: 'tag-channel' } : null,
  ].filter((chip): chip is Chip => Boolean(chip));

  if (chips.length === 0) {
    chips.push({ label: state === 'idle' ? 'Ready' : state, className: state === 'error' ? 'tag-warning' : 'tag-depth' });
  }

  return (
    <div className="tag-row player-tags" aria-label="Audio specifications">
      {chips.map((chip) => (
        <span className={`hifi-tag ${chip.className}`} key={chip.label}>
          {chip.label}
        </span>
      ))}
    </div>
  );
};
