import { memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { LibraryTrack } from '../../../shared/types/library';
import { TrackRow } from './TrackRow';

type TrackListProps = {
  tracks: LibraryTrack[];
  currentTrackId: string | null;
};

export const TrackList = memo(({ tracks, currentTrackId }: TrackListProps): JSX.Element => {
  const scrollParentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 70,
    overscan: 10,
  });

  return (
    <section className="track-list-card" aria-label="歌曲列表">
      <div className="track-list" ref={scrollParentRef} role="list" data-virtualized="true" data-estimated-row-height="70">
        <div className="track-virtual-spacer" style={{ height: rowVirtualizer.getTotalSize() }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const track = tracks[virtualRow.index];

            return (
              <div
                className="track-virtual-row"
                key={track.id}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <TrackRow isPlaying={track.id === currentTrackId} track={track} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

TrackList.displayName = 'TrackList';
