import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Headphones, Radio, RefreshCw, SlidersHorizontal, Waves, X, Zap } from 'lucide-react';
import type { AudioDeviceInfo, AudioOutputMode, AudioOutputSettings, AudioStatus } from '../../../shared/types/audio';

type AudioSettingsDrawerProps = {
  isOpen: boolean;
  status: AudioStatus | null;
  onClose: () => void;
  onStatusChange: (status: AudioStatus) => void;
};

const formatRate = (value: number | null | undefined): string => {
  if (!value) {
    return '';
  }

  return value >= 1000 ? `${Math.round(value / 1000)} kHz` : `${value} Hz`;
};

const formatBitrate = (value: number | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  return `${Math.round(value / 1000)} kbps`;
};

const deviceMatchesStatus = (device: AudioDeviceInfo, status: AudioStatus | null, mode: AudioOutputMode): boolean => {
  if (!status || status.outputMode !== mode) {
    return false;
  }

  return status.outputDeviceId === device.id || status.outputDeviceName === device.name;
};

export const AudioSettingsDrawer = ({
  isOpen,
  status,
  onClose,
  onStatusChange,
}: AudioSettingsDrawerProps): JSX.Element | null => {
  const [devices, setDevices] = useState<AudioDeviceInfo[]>([]);
  const [outputMode, setOutputMode] = useState<AudioOutputMode>(status?.outputMode ?? 'shared');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const sharedDevices = useMemo(() => devices.filter((device) => device.outputMode === 'shared'), [devices]);
  const asioDevices = useMemo(() => devices.filter((device) => device.outputMode === 'asio'), [devices]);
  const engineBadges = useMemo(() => {
    const badges: string[] = [];
    const bitrate = formatBitrate(status?.bitrate);
    const hasEq = status?.warnings.some((warning) => /eq|equalizer/i.test(warning)) ?? false;

    if (bitrate) {
      badges.push(bitrate);
    }

    if (hasEq) {
      badges.push('EQ');
    }

    if (status?.resampling || status?.sampleRateMismatch) {
      badges.push('重采样');
    }

    return badges;
  }, [status?.bitrate, status?.resampling, status?.sampleRateMismatch, status?.warnings]);

  const refresh = useCallback(async (): Promise<void> => {
    const audio = window.echo?.audio;

    if (!audio) {
      setError('Desktop bridge unavailable');
      setDevices([]);
      return;
    }

    try {
      const [nextDevices, nextStatus] = await Promise.all([audio.listDevices(), audio.getStatus()]);
      setDevices(nextDevices);
      setOutputMode(nextStatus.outputMode);
      onStatusChange(nextStatus);
      setError(null);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError));
    }
  }, [onStatusChange]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void refresh();
  }, [isOpen, refresh]);

  useEffect(() => {
    if (status?.outputMode) {
      setOutputMode(status.outputMode);
    }
  }, [status?.outputMode]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const applyOutput = useCallback(
    async (settings: AudioOutputSettings): Promise<void> => {
      const audio = window.echo?.audio;

      if (!audio) {
        setError('Desktop bridge unavailable');
        return;
      }

      setIsBusy(true);
      setError(null);
      try {
        const nextStatus = await audio.setOutput(settings);
        setOutputMode(nextStatus.outputMode);
        onStatusChange(nextStatus);
      } catch (applyError) {
        setError(applyError instanceof Error ? applyError.message : String(applyError));
      } finally {
        setIsBusy(false);
      }
    },
    [onStatusChange],
  );

  const applyDevice = (mode: AudioOutputMode, device: AudioDeviceInfo | null): void => {
    const settings: AudioOutputSettings = { outputMode: mode };

    if (device) {
      settings.deviceIndex = device.index;
      settings.deviceName = device.name;
    }

    setOutputMode(mode);
    void applyOutput(settings);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="audio-drawer-root no-drag" role="presentation">
      <button className="audio-drawer-scrim" type="button" aria-label="Close audio settings" onClick={onClose} />
      <aside className="audio-drawer" aria-label="音频设置">
        <header className="audio-drawer-header">
          <div>
            <SlidersHorizontal size={18} />
            <h2>音频设置</h2>
          </div>
          <button className="audio-drawer-close" type="button" aria-label="Close audio settings" title="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <button className="audio-engine-strip" type="button" onClick={() => void refresh()} disabled={isBusy}>
          <Zap size={16} />
          <span>HiFi Engine</span>
          <strong>
            {engineBadges.map((badge) => (
              <em key={badge}>{badge}</em>
            ))}
          </strong>
          <RefreshCw size={14} />
        </button>

        <div className="audio-mode-tabs" aria-label="Output mode">
          {(['shared', 'exclusive', 'asio'] as AudioOutputMode[]).map((mode) => (
            <button
              className={outputMode === mode ? 'active' : ''}
              key={mode}
              type="button"
              onClick={() => {
                setOutputMode(mode);
                if (mode === 'asio') {
                  const fallbackAsio = asioDevices.find((device) => device.isDefault) ?? asioDevices[0] ?? null;
                  applyDevice('asio', fallbackAsio);
                  return;
                }

                applyDevice(mode, status?.outputMode === mode ? null : sharedDevices.find((device) => device.isDefault) ?? null);
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <section className="audio-drawer-section">
          <div className="audio-drawer-section-title">
            <Headphones size={17} />
            <h3>输出设备</h3>
          </div>
          <button
            className={`audio-device-pill ${!status?.outputDeviceName && outputMode !== 'asio' ? 'active' : ''}`}
            type="button"
            disabled={isBusy}
            onClick={() => applyDevice(outputMode === 'asio' ? 'shared' : outputMode, null)}
          >
            <Waves size={15} />
            <span>系统默认</span>
            <em>{outputMode === 'exclusive' ? 'Exclusive' : 'Shared'}</em>
            {outputMode !== 'asio' && !status?.outputDeviceName ? <Check size={15} /> : null}
          </button>
          {sharedDevices.map((device) => {
            const isActive = deviceMatchesStatus(device, status, outputMode);

            return (
              <button
                className={`audio-device-pill ${isActive ? 'active' : ''}`}
                key={device.id}
                type="button"
                disabled={isBusy}
                onClick={() => applyDevice(outputMode === 'asio' ? 'shared' : outputMode, device)}
              >
                <Radio size={15} />
                <span>{device.name}</span>
                <em>{formatRate(device.sharedDeviceSampleRate ?? device.sampleRate)}</em>
                {isActive ? <Check size={15} /> : null}
              </button>
            );
          })}
        </section>

        <section className="audio-drawer-section">
          <div className="audio-drawer-section-title">
            <Zap size={17} />
            <h3>ASIO 输出设备</h3>
          </div>
          {asioDevices.length === 0 ? <p className="audio-drawer-empty">暂无 ASIO 设备</p> : null}
          {asioDevices.map((device) => {
            const isActive = deviceMatchesStatus(device, status, 'asio');

            return (
              <button
                className={`audio-device-pill ${isActive ? 'active' : ''}`}
                key={device.id}
                type="button"
                disabled={isBusy}
                onClick={() => applyDevice('asio', device)}
              >
                <Radio size={15} />
                <span>{device.name}</span>
                <em>ASIO</em>
                {isActive ? <Check size={15} /> : null}
              </button>
            );
          })}
        </section>

        {error ? <p className="audio-drawer-error">{error}</p> : null}
      </aside>
    </div>
  );
};
