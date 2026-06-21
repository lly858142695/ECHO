import { describe, expect, it } from 'vitest';
import { formatUserFacingError, getRawErrorMessage } from './userFacingError';

describe('userFacingError', () => {
  it('reads messages from common error shapes', () => {
    expect(getRawErrorMessage(new Error('broken'))).toBe('broken');
    expect(getRawErrorMessage('plain')).toBe('plain');
    expect(getRawErrorMessage(null)).toBe('');
  });

  it('hides remote IPC errors behind a friendly desktop bridge message', () => {
    const message = formatUserFacingError(
      new Error("Error invoking remote method 'downloads:create-job': Error: spawn yt-dlp ENOENT"),
      { context: 'downloads' },
    );

    expect(message).toContain('桌面桥接暂不可用');
    expect(message).not.toContain('remote method');
    expect(message).not.toContain('spawn');
  });

  it('explains database corruption without leaking SQLite internals', () => {
    const message = formatUserFacingError(new Error('SQLITE_CORRUPT: database disk image is malformed'), {
      context: 'library',
    });

    expect(message).toContain('曲库数据库可能已损坏');
    expect(message).not.toContain('SQLITE_CORRUPT');
  });

  it('explains file permission and network failures', () => {
    expect(formatUserFacingError(new Error('EPERM: operation not permitted'), { context: 'folders' })).toContain('没有权限');
    expect(formatUserFacingError(new Error('fetch failed: ECONNRESET'), { context: 'streaming' })).toContain('网络连接暂时失败');
  });

  it('uses the contextual fallback for unknown technical errors', () => {
    const message = formatUserFacingError(new Error('TypeError: Cannot read properties of undefined'), {
      context: 'plugins',
      fallback: '插件失败',
    });

    expect(message).toBe('插件失败');
  });
});
