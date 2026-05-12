import type { ChangeEvent, KeyboardEvent, PointerEvent } from 'react';
import { formatTime } from './playerFormat';

type PlayerProgressProps = {
  disabled: boolean;
  durationSeconds: number;
  positionSeconds: number;
  onPreview: (positionSeconds: number) => void;
  onCommit: (positionSeconds: number) => void;
};

export const PlayerProgress = ({
  disabled,
  durationSeconds,
  positionSeconds,
  onPreview,
  onCommit,
}: PlayerProgressProps): JSX.Element => {
  const boundedPositionSeconds =
    durationSeconds > 0 ? Math.min(durationSeconds, Math.max(0, positionSeconds)) : 0;
  const progressPercent =
    durationSeconds > 0 ? Math.min(100, Math.max(0, (boundedPositionSeconds / durationSeconds) * 100)) : 0;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onPreview(Number(event.currentTarget.value));
  };

  const handlePointerCommit = (event: PointerEvent<HTMLInputElement>): void => {
    onCommit(Number(event.currentTarget.value));
  };

  const handleKeyCommit = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === ' ' || event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
      onCommit(Number(event.currentTarget.value));
    }
  };

  return (
    <div className="progress-row" aria-label="Playback position">
      <span>{formatTime(boundedPositionSeconds)}</span>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        <div className="progress-thumb" style={{ left: `${progressPercent}%` }} />
        <input
          aria-label="Seek position"
          className="progress-slider"
          disabled={disabled || durationSeconds <= 0}
          max={Math.max(0, durationSeconds)}
          min={0}
          onChange={handleChange}
          onKeyUp={handleKeyCommit}
          onPointerUp={handlePointerCommit}
          step={0.1}
          type="range"
          value={boundedPositionSeconds}
        />
      </div>
      <span>{formatTime(durationSeconds)}</span>
    </div>
  );
};
