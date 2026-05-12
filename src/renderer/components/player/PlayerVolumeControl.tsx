import { useCallback, useEffect, useRef, useState } from 'react';
import type { WheelEvent } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import type { AudioStatus } from '../../../shared/types/audio';
import { formatPercent } from './playerFormat';

type PlayerVolumeControlProps = {
  status: AudioStatus | null;
  onStatusChange: (status: AudioStatus) => void;
  onError: (message: string) => void;
};

const volumeFromStatus = (status: AudioStatus | null): number => {
  return Math.max(0, Math.min(1, status?.volume ?? 1));
};

export const PlayerVolumeControl = ({ status, onStatusChange, onError }: PlayerVolumeControlProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(volumeFromStatus(status));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pendingCommitRef = useRef<number | null>(null);
  const Icon = volume <= 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  useEffect(() => {
    setVolume(volumeFromStatus(status));
  }, [status]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => window.removeEventListener('pointerdown', handlePointerDown, true);
  }, [isOpen]);

  const commitVolume = useCallback(
    async (nextVolume: number): Promise<void> => {
      const audio = window.echo?.audio;
      const safeVolume = Math.max(0, Math.min(1, nextVolume));
      setVolume(safeVolume);
      pendingCommitRef.current = safeVolume;

      if (!audio) {
        onError('Desktop bridge unavailable');
        return;
      }

      try {
        const nextStatus = await audio.setOutput({ volume: safeVolume });
        if (pendingCommitRef.current === safeVolume) {
          onStatusChange(nextStatus);
        }
      } catch (error) {
        onError(error instanceof Error ? error.message : String(error));
      }
    },
    [onError, onStatusChange],
  );

  const handleWheel = (event: WheelEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsOpen(true);
    const direction = event.deltaY > 0 ? -1 : 1;
    void commitVolume(volume + direction * 0.03);
  };

  return (
    <div className="volume-control" ref={rootRef} onMouseEnter={() => setIsOpen(true)} onWheel={handleWheel}>
      <button
        className="icon-button"
        type="button"
        aria-label="Volume"
        title="Volume"
        onClick={() => setIsOpen(true)}
        onFocus={() => setIsOpen(true)}
      >
        <Icon size={18} />
      </button>
      {isOpen ? (
        <div className="volume-popover">
          <span>{formatPercent(volume)}</span>
          <input
            aria-label="Volume level"
            max={1}
            min={0}
            onChange={(event) => setVolume(Number(event.currentTarget.value))}
            onKeyUp={(event) => {
              if (event.key === 'Enter' || event.key === ' ' || event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
                void commitVolume(Number(event.currentTarget.value));
              }
            }}
            onPointerUp={(event) => void commitVolume(Number(event.currentTarget.value))}
            step={0.01}
            type="range"
            value={volume}
          />
        </div>
      ) : null}
    </div>
  );
};
