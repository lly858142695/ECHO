// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FirstRunWizard } from './FirstRunWizard';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.echo = undefined as unknown as typeof window.echo;
});

describe('FirstRunWizard', () => {
  it('opens the official ECHO docs through the desktop bridge', async () => {
    const openExternalUrl = vi.fn().mockResolvedValue(undefined);
    window.echo = {
      app: {
        openExternalUrl,
      },
    } as unknown as Window['echo'];

    render(<FirstRunWizard initialSettings={null} onClose={vi.fn()} onCompleted={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '查看 ECHO 文档' }));

    await waitFor(() => expect(openExternalUrl).toHaveBeenCalledWith('https://echonext.moe/zh/docs/'));
  });
});
