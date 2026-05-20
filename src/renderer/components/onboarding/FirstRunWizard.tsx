import { useCallback, useMemo, useState } from 'react';
import { FolderOpen, HardDrive, Headphones, Loader2, ScanLine, X } from 'lucide-react';
import type { AudioOutputMode } from '../../../shared/types/audio';
import type { AppSettings, ScanPerformanceMode } from '../../../shared/types/appSettings';
import { rememberLibraryScanStatus } from '../../stores/libraryScanSession';

type FirstRunWizardProps = {
  initialSettings: AppSettings | null;
  onClose: () => void;
  onCompleted: (settings: AppSettings | null) => void;
};

const scanModes: Array<{ mode: ScanPerformanceMode; label: string; description: string }> = [
  { mode: 'balanced', label: '均衡扫描', description: '默认选择，尽量不影响播放。' },
  { mode: 'low', label: '低占用扫描', description: '后台慢慢扫，适合边听边整理。' },
  { mode: 'performance', label: '快速扫描', description: '更快建立索引，空闲时使用。' },
];

const outputModes: Array<{ mode: AudioOutputMode; label: string; description: string }> = [
  { mode: 'shared', label: 'Shared', description: '推荐日常使用，稳定优先。' },
  { mode: 'system', label: '系统音频', description: '兼容模式，走系统默认输出。' },
  { mode: 'exclusive', label: 'Exclusive', description: '独占输出，适合后续验收。' },
  { mode: 'asio', label: 'ASIO', description: '需要 ASIO 设备和驱动。' },
];

export const FirstRunWizard = ({ initialSettings, onClose, onCompleted }: FirstRunWizardProps): JSX.Element => {
  const [musicFolderPath, setMusicFolderPath] = useState<string | null>(null);
  const [cacheDirectory, setCacheDirectory] = useState<string | null | undefined>(undefined);
  const [scanMode, setScanMode] = useState<ScanPerformanceMode>(initialSettings?.scanPerformanceMode ?? 'balanced');
  const [outputMode, setOutputMode] = useState<AudioOutputMode>(initialSettings?.rememberedAudioOutput?.outputMode ?? 'shared');
  const [scanNow, setScanNow] = useState(true);
  const [busy, setBusy] = useState<'folder' | 'cache' | 'finish' | 'skip' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cacheDirectoryLabel = useMemo(() => {
    if (cacheDirectory === undefined) {
      return initialSettings?.coverCacheDir ?? '使用默认封面缓存位置';
    }
    return cacheDirectory ?? '使用默认封面缓存位置';
  }, [cacheDirectory, initialSettings?.coverCacheDir]);

  const chooseMusicFolder = useCallback(async (): Promise<void> => {
    const library = window.echo?.library;
    if (!library?.chooseFolder) {
      setError('桌面桥接不可用，暂时不能选择音乐文件夹。');
      return;
    }

    try {
      setBusy('folder');
      setError(null);
      const chosen = await library.chooseFolder();
      if (chosen) {
        setMusicFolderPath(chosen);
      }
    } catch (chooseError) {
      setError(chooseError instanceof Error ? chooseError.message : String(chooseError));
    } finally {
      setBusy(null);
    }
  }, []);

  const chooseCacheDirectory = useCallback(async (): Promise<void> => {
    const app = window.echo?.app;
    if (!app?.chooseCacheDirectory) {
      setError('桌面桥接不可用，暂时不能选择缓存位置。');
      return;
    }

    try {
      setBusy('cache');
      setError(null);
      const chosen = await app.chooseCacheDirectory();
      if (chosen) {
        setCacheDirectory(chosen);
      }
    } catch (chooseError) {
      setError(chooseError instanceof Error ? chooseError.message : String(chooseError));
    } finally {
      setBusy(null);
    }
  }, []);

  const skip = useCallback(async (): Promise<void> => {
    try {
      setBusy('skip');
      setError(null);
      const settings = await window.echo?.app?.setSettings?.({ onboardingCompleted: true });
      onCompleted(settings ?? null);
      onClose();
    } catch (skipError) {
      setError(skipError instanceof Error ? skipError.message : String(skipError));
    } finally {
      setBusy(null);
    }
  }, [onClose, onCompleted]);

  const finish = useCallback(async (): Promise<void> => {
    const app = window.echo?.app;
    const library = window.echo?.library;

    if (!app?.setSettings) {
      setError('桌面桥接不可用，暂时不能保存首次启动设置。');
      return;
    }

    try {
      setBusy('finish');
      setError(null);
      setMessage(null);

      if (cacheDirectory !== undefined && app.setCoverCacheDirectory) {
        await app.setCoverCacheDirectory({ directory: cacheDirectory, migrate: false });
      }

      const currentSettings = await app.getSettings().catch(() => initialSettings);
      const rememberedAudioOutput = {
        ...(currentSettings?.rememberedAudioOutput ?? initialSettings?.rememberedAudioOutput),
        enabled: true,
        outputMode,
      };
      const nextSettings = await app.setSettings({
        onboardingCompleted: true,
        scanPerformanceMode: scanMode,
        rememberedAudioOutput,
      });

      await window.echo?.audio?.setOutput?.({ outputMode }).catch(() => undefined);

      if (musicFolderPath && library?.addFolder) {
        const folder = await library.addFolder(musicFolderPath);
        if (scanNow && library.scanFolder) {
          rememberLibraryScanStatus(await library.scanFolder(folder.id));
        }
        window.dispatchEvent(new Event('library:changed'));
      }

      window.dispatchEvent(new Event('settings:changed'));
      setMessage('首次启动设置已保存。');
      onCompleted(nextSettings);
      onClose();
    } catch (finishError) {
      setError(finishError instanceof Error ? finishError.message : String(finishError));
    } finally {
      setBusy(null);
    }
  }, [cacheDirectory, initialSettings, musicFolderPath, onClose, onCompleted, outputMode, scanMode, scanNow]);

  return (
    <div className="first-run-backdrop" role="dialog" aria-modal="true" aria-labelledby="first-run-title">
      <section className="first-run-panel">
        <header className="first-run-header">
          <div>
            <span className="section-kicker">ECHO Next</span>
            <h2 id="first-run-title">首次启动向导</h2>
            <p>先把最影响体验的几件事放好；也可以跳过，之后在设置里再改。</p>
          </div>
          <button className="queue-icon-button" type="button" aria-label="跳过向导" title="跳过向导" disabled={busy !== null} onClick={() => void skip()}>
            <X size={17} />
          </button>
        </header>

        <div className="first-run-grid">
          <section className="first-run-step">
            <FolderOpen size={20} />
            <div>
              <h3>音乐文件夹</h3>
              <p>{musicFolderPath ?? '选择你的本地音乐目录，ECHO 会把它加入曲库。'}</p>
              <div className="settings-chip-row settings-chip-row--left">
                <button className="settings-action-button" type="button" disabled={busy !== null} onClick={() => void chooseMusicFolder()}>
                  {busy === 'folder' ? <Loader2 className="spinning-icon" size={15} /> : <FolderOpen size={15} />}
                  选择文件夹
                </button>
                <label className="settings-inline-toggle">
                  <span>完成后扫描</span>
                  <input type="checkbox" checked={scanNow} onChange={(event) => setScanNow(event.target.checked)} />
                </label>
              </div>
            </div>
          </section>

          <section className="first-run-step">
            <HardDrive size={20} />
            <div>
              <h3>缓存位置</h3>
              <p>{cacheDirectoryLabel}</p>
              <div className="settings-chip-row settings-chip-row--left">
                <button className="settings-action-button" type="button" disabled={busy !== null} onClick={() => void chooseCacheDirectory()}>
                  {busy === 'cache' ? <Loader2 className="spinning-icon" size={15} /> : <HardDrive size={15} />}
                  选择缓存位置
                </button>
                <button className="settings-action-button" type="button" disabled={busy !== null} onClick={() => setCacheDirectory(null)}>
                  使用默认
                </button>
              </div>
            </div>
          </section>

          <section className="first-run-step">
            <ScanLine size={20} />
            <div>
              <h3>扫描模式</h3>
              <div className="first-run-options">
                {scanModes.map((item) => (
                  <button
                    className={scanMode === item.mode ? 'is-active' : undefined}
                    key={item.mode}
                    type="button"
                    aria-pressed={scanMode === item.mode}
                    onClick={() => setScanMode(item.mode)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="first-run-step">
            <Headphones size={20} />
            <div>
              <h3>音频输出</h3>
              <div className="first-run-options">
                {outputModes.map((item) => (
                  <button
                    className={outputMode === item.mode ? 'is-active' : undefined}
                    key={item.mode}
                    type="button"
                    aria-pressed={outputMode === item.mode}
                    onClick={() => setOutputMode(item.mode)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {error ? <p className="settings-inline-error">{error}</p> : null}
        {message ? <p className="settings-inline-note">{message}</p> : null}

        <footer className="first-run-actions">
          <button className="settings-action-button" type="button" disabled={busy !== null} onClick={() => void skip()}>
            跳过
          </button>
          <button className="settings-action-button first-run-primary" type="button" disabled={busy !== null} onClick={() => void finish()}>
            {busy === 'finish' ? <Loader2 className="spinning-icon" size={15} /> : null}
            完成设置
          </button>
        </footer>
      </section>
    </div>
  );
};
