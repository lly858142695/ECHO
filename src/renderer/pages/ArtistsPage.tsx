import { useCallback, useEffect, useRef, useState } from 'react';
import type { UIEvent } from 'react';
import { ChevronDown, RefreshCw, Search } from 'lucide-react';
import type { LibraryArtist, LibrarySort } from '../../shared/types/library';

const pageSize = 96;
const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

const artistMark = (name: string): string => {
  const trimmed = name.trim();

  if (!trimmed) {
    return '?';
  }

  if (/^[\dA-Za-z]/.test(trimmed)) {
    const compact = trimmed.replace(/^[^\dA-Za-z]+/, '').replace(/\s+/g, '');
    return compact.slice(0, Math.min(2, compact.length)).toLocaleUpperCase();
  }

  const graphemes = segmenter ? Array.from(segmenter.segment(trimmed), (part) => part.segment) : Array.from(trimmed);
  return graphemes.slice(0, 2).join('');
};

const artistMeta = (artist: LibraryArtist): string => {
  const parts: string[] = [];

  if (artist.trackCount > 0) {
    parts.push(`${artist.trackCount} tracks`);
  }

  if (artist.albumCount > 0) {
    parts.push(`${artist.albumCount} albums`);
  }

  return parts.join(' / ') || 'No tracks';
};

export const ArtistsPage = (): JSX.Element => {
  const [artists, setArtists] = useState<LibraryArtist[]>([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<LibrarySort>('default');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadArtists = useCallback(
    async (nextPage: number, mode: 'replace' | 'append') => {
      if (mode === 'append' && isLoadingRef.current) {
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const library = window.echo?.library;

        if (!library?.getArtists) {
          setArtists([]);
          setPage(1);
          setTotal(0);
          setHasMore(false);
          setError('Desktop bridge unavailable. Open ECHO Next in Electron to read artists.');
          return;
        }

        const result = await library.getArtists({
          page: nextPage,
          pageSize,
          search,
          sort,
        });

        if (requestIdRef.current !== requestId) {
          return;
        }

        setArtists((current) => (mode === 'append' ? [...current, ...result.items] : result.items));
        setPage(result.page);
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (loadError) {
        if (requestIdRef.current === requestId) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      } finally {
        if (requestIdRef.current === requestId) {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [search, sort],
  );

  useEffect(() => {
    void loadArtists(1, 'replace');
  }, [loadArtists]);

  useEffect(() => {
    const handleLibraryChanged = (): void => {
      void loadArtists(1, 'replace');
    };

    window.addEventListener('library:changed', handleLibraryChanged);
    return () => window.removeEventListener('library:changed', handleLibraryChanged);
  }, [loadArtists]);

  const handleArtistWallScroll = useCallback(
    (event: UIEvent<HTMLElement>): void => {
      if (isLoadingRef.current || !hasMore) {
        return;
      }

      const target = event.currentTarget;
      const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

      if (distanceToBottom < 360) {
        void loadArtists(page + 1, 'append');
      }
    },
    [hasMore, loadArtists, page],
  );

  const handleRefresh = useCallback((): void => {
    void loadArtists(1, 'replace');
  }, [loadArtists]);

  return (
    <div className="artists-page">
      <header className="songs-header">
        <div className="songs-title-group">
          <h1>Artists</h1>
          <span>{total} total</span>
        </div>
        <button className="tool-button album-refresh" type="button" aria-label="Refresh" title="Refresh" onClick={handleRefresh}>
          <RefreshCw size={17} />
        </button>
      </header>

      <div className="songs-control-row">
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search artists"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>

        <label className="sort-button sort-select">
          <select value={sort} onChange={(event) => setSort(event.target.value as LibrarySort)}>
            <option value="default">Default</option>
            <option value="titleAsc">Name A-Z</option>
            <option value="titleDesc">Name Z-A</option>
            <option value="frequent">Most Tracks</option>
            <option value="createdAsc">Created Oldest</option>
            <option value="createdDesc">Created Newest</option>
            <option value="random">Random</option>
          </select>
          <ChevronDown size={15} />
        </label>
      </div>

      <section className="artist-wall" aria-label="Artist list" onScroll={handleArtistWallScroll}>
        {artists.map((artist) => (
          <article className="artist-card" key={artist.id}>
            <div className="artist-avatar" aria-hidden="true">
              <span>{artistMark(artist.name)}</span>
            </div>
            <div className="artist-copy">
              <strong>{artist.name}</strong>
              <small>{artistMeta(artist)}</small>
            </div>
          </article>
        ))}
      </section>

      {error || isLoading ? (
        <div className="list-footer">
          <span>{error ?? 'Loading artists...'}</span>
        </div>
      ) : null}
    </div>
  );
};
