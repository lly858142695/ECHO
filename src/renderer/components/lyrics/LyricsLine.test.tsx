// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LyricsLine } from './LyricsLine';

afterEach(() => {
  cleanup();
});

describe('LyricsLine', () => {
  const line = { timeMs: 1000, text: 'Sakura', romanization: 'sakura', translation: 'Cherry blossoms' };

  it('shows romanization when enabled', () => {
    render(<LyricsLine active={false} line={line} past={false} onSeek={vi.fn()} />);

    expect(screen.getByText('sakura')).toBeTruthy();
  });

  it('prefers kana over romanization when both are available', () => {
    render(
      <LyricsLine
        active={false}
        line={{ ...line, kana: 'さくら' }}
        past={false}
        onSeek={vi.fn()}
      />,
    );

    expect(screen.getByText('さくら')).toBeTruthy();
    expect(screen.queryByText('sakura')).toBeNull();
  });

  it('hides romanization when disabled', () => {
    render(<LyricsLine active={false} line={line} past={false} showRomanization={false} onSeek={vi.fn()} />);

    expect(screen.queryByText('sakura')).toBeNull();
    expect(screen.getByText('Sakura')).toBeTruthy();
  });

  it('shows translation when enabled', () => {
    render(<LyricsLine active={false} line={line} past={false} onSeek={vi.fn()} />);

    expect(screen.getByText('Cherry blossoms')).toBeTruthy();
  });

  it('hides translation when disabled', () => {
    render(<LyricsLine active={false} line={line} past={false} showTranslation={false} onSeek={vi.fn()} />);

    expect(screen.queryByText('Cherry blossoms')).toBeNull();
  });

  it('marks how many secondary lyric rows are visible', () => {
    const { container, rerender } = render(<LyricsLine active line={line} past={false} onSeek={vi.fn()} />);

    expect(container.querySelector('.lyrics-line')?.getAttribute('data-secondary-lines')).toBe('2');

    rerender(<LyricsLine active line={line} past={false} showTranslation={false} onSeek={vi.fn()} />);

    expect(container.querySelector('.lyrics-line')?.getAttribute('data-secondary-lines')).toBe('1');
  });

  it('renders timed words only when word highlighting is enabled', () => {
    const timedLine = {
      timeMs: 1000,
      text: 'Hello world',
      words: [
        { text: 'Hello ', startMs: 1000, endMs: 1500 },
        { text: 'world', startMs: 1500, endMs: null },
      ],
    };
    const { container, rerender } = render(
      <LyricsLine active line={timedLine} past={false} onSeek={vi.fn()} wordHighlightEnabled />,
    );

    expect(Array.from(container.querySelectorAll('.lyrics-word')).map((word) => word.textContent)).toEqual([
      'Hello ',
      'world',
    ]);
    expect(container.querySelector('.lyrics-line')?.getAttribute('data-word-highlight')).toBe('true');

    rerender(<LyricsLine active line={timedLine} past={false} onSeek={vi.fn()} wordHighlightEnabled={false} />);

    expect(container.querySelector('.lyrics-word')).toBeNull();
    expect(screen.getByText('Hello world')).toBeTruthy();
    expect(container.querySelector('.lyrics-line')?.getAttribute('data-word-highlight')).toBe('false');
  });
});
