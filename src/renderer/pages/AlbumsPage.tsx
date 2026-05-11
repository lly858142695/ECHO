import { useCallback, useEffect, useRef, useState } from 'react';
import { Disc3, RefreshCw } from 'lucide-react';
import type { LibraryAlbum } from '../../shared/types/library';

const pageSize = 60;

export const AlbumsPage = (): JSX.Element => {
  const [albums, setAlbums] = useState<LibraryAlbum[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadAlbums = useCallback(async (nextPage: number, mode: 'replace' | 'append') => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.echo.library.getAlbums({
        page: nextPage,
        pageSize,
        sort: 'title',
      });

      if (requestIdRef.current !== requestId) {
        return;
      }

      setAlbums((current) => (mode === 'append' ? [...current, ...result.items] : result.items));
      setPage(result.page);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (loadError) {
      if (requestIdRef.current === requestId) {
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAlbums(1, 'replace');
  }, [loadAlbums]);

  return (
    <div className="albums-page">
      <header className="songs-header">
        <div className="songs-title-group">
          <h1>专辑</h1>
          <span>{total} 张</span>
        </div>
        <button className="tool-button album-refresh" type="button" aria-label="刷新" title="刷新" onClick={() => loadAlbums(1, 'replace')}>
          <RefreshCw size={17} />
        </button>
      </header>

      <section className="album-wall" aria-label="专辑列表">
        {albums.map((album) => (
          <article className="album-card" key={album.id}>
            <div className="album-cover" data-empty={!album.coverThumb} aria-hidden="true">
              {album.coverThumb ? <img alt="" src={album.coverThumb} /> : <Disc3 size={24} />}
            </div>
            <div className="album-copy">
              <strong>{album.title}</strong>
              <span>{album.albumArtist}</span>
              <small>{album.trackCount} 首</small>
            </div>
          </article>
        ))}
      </section>

      <div className="list-footer">
        <span>{error ?? (isLoading ? '正在读取专辑...' : `已加载 ${albums.length} / ${total}`)}</span>
        <button
          className="load-more-button"
          type="button"
          onClick={() => loadAlbums(page + 1, 'append')}
          disabled={!hasMore || isLoading}
        >
          加载更多
        </button>
      </div>
    </div>
  );
};
