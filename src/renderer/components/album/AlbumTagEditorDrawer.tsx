import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, CloudDownload, Disc3, ImagePlus, RefreshCw, Save, Tag, X } from 'lucide-react';
import type { EditableAlbumTags, LibraryAlbum, NetworkTagCandidate, TrackCoverSelection } from '../../../shared/types/library';

type AlbumTagEditorDrawerProps = {
  album: LibraryAlbum | null;
  isOpen: boolean;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (album: LibraryAlbum, tags: EditableAlbumTags, coverPath: string | null, coverUrl: string | null, coverMimeType: string | null) => void;
};

type AlbumTagFormState = {
  album: string;
  albumArtist: string;
  year: string;
  genre: string;
};

type PendingNetworkCover = {
  url: string;
  mimeType: string | null;
  previewUrl: string;
};

type NetworkFieldSelection = Record<keyof AlbumTagFormState | 'cover', boolean>;

const networkFieldLabels: Array<{ key: keyof AlbumTagFormState | 'cover'; label: string }> = [
  { key: 'album', label: '专辑' },
  { key: 'albumArtist', label: '专辑艺术家' },
  { key: 'year', label: '年份' },
  { key: 'genre', label: '流派' },
  { key: 'cover', label: '封面' },
];

const emptyNetworkSelection = (): NetworkFieldSelection => ({
  album: false,
  albumArtist: false,
  year: false,
  genre: false,
  cover: false,
});

const stateFromAlbum = (album: LibraryAlbum | null): AlbumTagFormState => ({
  album: album?.title ?? '',
  albumArtist: album?.albumArtist ?? '',
  year: album?.year ? String(album.year) : '',
  genre: '',
});

const numberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
};

const hasFormValue = (value: string): boolean => value.trim().length > 0;
const hasCandidateText = (value: string | null | undefined): boolean => (value ?? '').trim().length > 0;
const candidateNumberText = (value: number | null | undefined): string => (typeof value === 'number' && Number.isFinite(value) ? String(value) : '');
const fieldValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '空';
  }
  return String(value);
};

const allNetworkFieldsSelected = (selection: NetworkFieldSelection): boolean => networkFieldLabels.every((field) => selection[field.key]);
const someNetworkFieldsSelected = (selection: NetworkFieldSelection): boolean => networkFieldLabels.some((field) => selection[field.key]);

const validatePositiveInteger = (value: string, label: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^\d+$/u.test(trimmed) || Number(trimmed) <= 0) {
    return `${label}必须是正整数或留空`;
  }
  return null;
};

const formatDuration = (duration: number): string => {
  if (!Number.isFinite(duration) || duration <= 0) {
    return '未知时长';
  }

  const totalMinutes = Math.round(duration / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} 小时 ${minutes} 分钟` : `${totalMinutes} 分钟`;
};

const candidateFieldValue = (candidate: NetworkTagCandidate, key: keyof AlbumTagFormState): string => {
  switch (key) {
    case 'album':
      return candidate.album;
    case 'albumArtist':
      return candidate.albumArtist;
    case 'year':
      return candidateNumberText(candidate.year);
    case 'genre':
      return candidate.genre ?? '';
  }
};

const defaultNetworkFieldSelection = (
  form: AlbumTagFormState,
  album: Pick<LibraryAlbum, 'coverThumb'>,
  candidate: NetworkTagCandidate,
): NetworkFieldSelection => {
  const highConfidence = candidate.confidence >= 0.93;
  return {
    album: hasCandidateText(candidate.album) && (!hasFormValue(form.album) || highConfidence),
    albumArtist: hasCandidateText(candidate.albumArtist) && (!hasFormValue(form.albumArtist) || highConfidence),
    year: candidate.year !== null && (!hasFormValue(form.year) || highConfidence),
    genre: hasCandidateText(candidate.genre) && (!hasFormValue(form.genre) || highConfidence),
    cover: Boolean(candidate.coverUrl) && (!album.coverThumb || highConfidence),
  };
};

const applyNetworkCandidateToForm = (
  form: AlbumTagFormState,
  candidate: NetworkTagCandidate,
  fields: NetworkFieldSelection,
): AlbumTagFormState => ({
  ...form,
  album: fields.album && hasCandidateText(candidate.album) ? candidate.album : form.album,
  albumArtist: fields.albumArtist && hasCandidateText(candidate.albumArtist) ? candidate.albumArtist : form.albumArtist,
  year: fields.year ? candidateNumberText(candidate.year) : form.year,
  genre: fields.genre && candidate.genre ? candidate.genre : form.genre,
});

export const AlbumTagEditorDrawer = ({ album, isOpen, isSaving, error, onClose, onSave }: AlbumTagEditorDrawerProps): JSX.Element | null => {
  const [form, setForm] = useState<AlbumTagFormState>(() => stateFromAlbum(album));
  const [selectedCover, setSelectedCover] = useState<TrackCoverSelection | null>(null);
  const [pendingNetworkCover, setPendingNetworkCover] = useState<PendingNetworkCover | null>(null);
  const [loadedCoverThumb, setLoadedCoverThumb] = useState<string | null>(null);
  const [representativeTrackId, setRepresentativeTrackId] = useState<string | null>(null);
  const [isLoadingEmbedded, setIsLoadingEmbedded] = useState(false);
  const [isSearchingNetwork, setIsSearchingNetwork] = useState(false);
  const [networkCandidates, setNetworkCandidates] = useState<NetworkTagCandidate[]>([]);
  const [selectedNetworkCandidate, setSelectedNetworkCandidate] = useState<NetworkTagCandidate | null>(null);
  const [networkFieldSelection, setNetworkFieldSelection] = useState<NetworkFieldSelection>(() => emptyNetworkSelection());
  const [networkMessage, setNetworkMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const initialForm = useMemo(() => stateFromAlbum(album), [album]);
  const previewCover = selectedCover?.dataUrl ?? pendingNetworkCover?.previewUrl ?? loadedCoverThumb ?? album?.coverThumb ?? null;
  const yearError = useMemo(() => validatePositiveInteger(form.year, '年份'), [form.year]);
  const isBusy = isSaving || isLoadingEmbedded || isSearchingNetwork;
  const isDirty = useMemo(
    () =>
      Boolean(
        album &&
          (JSON.stringify(form) !== JSON.stringify(initialForm) ||
            selectedCover ||
            pendingNetworkCover ||
            loadedCoverThumb !== null),
      ),
    [album, form, initialForm, loadedCoverThumb, pendingNetworkCover, selectedCover],
  );

  useEffect(() => {
    if (album) {
      setForm(stateFromAlbum(album));
      setSelectedCover(null);
      setPendingNetworkCover(null);
      setLoadedCoverThumb(null);
      setRepresentativeTrackId(null);
      setNetworkCandidates([]);
      setSelectedNetworkCandidate(null);
      setNetworkFieldSelection(emptyNetworkSelection());
      setNetworkMessage(null);
      setLocalError(null);
      setShowDiscardConfirm(false);
    }
  }, [album]);

  const requestClose = (): void => {
    if (isSaving) {
      return;
    }
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        requestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!album) {
    return null;
  }

  const getRepresentativeTrackId = async (): Promise<string> => {
    if (representativeTrackId) {
      return representativeTrackId;
    }

    const library = window.echo?.library;
    if (!library?.getAlbumTracks) {
      throw new Error('当前运行环境不支持读取专辑曲目。');
    }

    const result = await library.getAlbumTracks(album.id, { page: 1, pageSize: 1 });
    const trackId = result.items[0]?.id;
    if (!trackId) {
      throw new Error('这张专辑没有可读取标签的歌曲。');
    }

    setRepresentativeTrackId(trackId);
    return trackId;
  };

  const updateField = (field: keyof AlbumTagFormState, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setShowDiscardConfirm(false);
  };

  const handleChooseCover = async (): Promise<void> => {
    const library = window.echo?.library;

    if (!library?.chooseTrackCover) {
      setLocalError('当前运行环境不支持选择封面。');
      return;
    }

    try {
      setLocalError(null);
      const selection = await library.chooseTrackCover();
      if (selection) {
        setSelectedCover(selection);
        setPendingNetworkCover(null);
        setLoadedCoverThumb(null);
        setShowDiscardConfirm(false);
      }
    } catch (chooseError) {
      setLocalError(chooseError instanceof Error ? chooseError.message : String(chooseError));
    }
  };

  const handleLoadEmbedded = async (): Promise<void> => {
    const library = window.echo?.library;

    if (!library?.loadEmbeddedTrackTags) {
      setLocalError('当前运行环境不支持读取内嵌标签。');
      return;
    }

    setIsLoadingEmbedded(true);
    setLocalError(null);

    try {
      const trackId = await getRepresentativeTrackId();
      const result = await library.loadEmbeddedTrackTags(trackId);
      setForm({
        album: result.tags.album,
        albumArtist: result.tags.albumArtist,
        year: result.tags.year ? String(result.tags.year) : '',
        genre: result.tags.genre ?? '',
      });
      setSelectedCover(null);
      setPendingNetworkCover(null);
      setLoadedCoverThumb(result.coverThumb);
      setShowDiscardConfirm(false);
    } catch (loadError) {
      setLocalError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setIsLoadingEmbedded(false);
    }
  };

  const handleSearchNetwork = async (): Promise<void> => {
    const library = window.echo?.library;

    if (!library?.searchNetworkTagCandidates) {
      setLocalError('当前运行环境不支持网络标签搜索。');
      return;
    }

    setIsSearchingNetwork(true);
    setLocalError(null);
    setNetworkMessage('正在搜索网络标签...');
    setSelectedNetworkCandidate(null);
    setNetworkFieldSelection(emptyNetworkSelection());

    try {
      const trackId = await getRepresentativeTrackId();
      const candidates = await library.searchNetworkTagCandidates(trackId);
      setNetworkCandidates(candidates);
      setNetworkMessage(candidates.length ? null : '没有找到合适的网络标签。');
    } catch (searchError) {
      setNetworkCandidates([]);
      setNetworkMessage(null);
      setLocalError(searchError instanceof Error ? searchError.message : '网络来源暂时不可用，请稍后再试。');
    } finally {
      setIsSearchingNetwork(false);
    }
  };

  const handleSelectNetworkCandidate = (candidate: NetworkTagCandidate): void => {
    setSelectedNetworkCandidate(candidate);
    setNetworkFieldSelection(defaultNetworkFieldSelection(form, album, candidate));
  };

  const handleToggleNetworkField = (field: keyof NetworkFieldSelection): void => {
    setNetworkFieldSelection((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleToggleAllNetworkFields = (): void => {
    setNetworkFieldSelection((current) => {
      const nextChecked = !allNetworkFieldsSelected(current);
      return networkFieldLabels.reduce(
        (next, field) => ({
          ...next,
          [field.key]: nextChecked,
        }),
        emptyNetworkSelection(),
      );
    });
  };

  const handleApplyNetworkCandidate = (): void => {
    if (!selectedNetworkCandidate) {
      return;
    }

    setForm((current) => applyNetworkCandidateToForm(current, selectedNetworkCandidate, networkFieldSelection));

    if (networkFieldSelection.cover && selectedNetworkCandidate.coverUrl) {
      setPendingNetworkCover({
        url: selectedNetworkCandidate.coverUrl,
        mimeType: selectedNetworkCandidate.coverMimeType ?? null,
        previewUrl: selectedNetworkCandidate.coverPreviewUrl ?? selectedNetworkCandidate.coverUrl,
      });
      setSelectedCover(null);
      setLoadedCoverThumb(null);
    }

    setNetworkMessage('已应用到表单，点击保存后才会写入专辑内歌曲。');
    setShowDiscardConfirm(false);
  };

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    setLocalError(null);
    if (yearError) {
      setLocalError('请先修正年份，再保存标签。');
      return;
    }

    onSave(
      album,
      {
        album: form.album,
        albumArtist: form.albumArtist,
        year: numberOrNull(form.year),
        genre: form.genre.trim() || null,
      },
      selectedCover?.path ?? null,
      selectedCover ? null : (pendingNetworkCover?.url ?? null),
      selectedCover ? null : (pendingNetworkCover?.mimeType ?? null),
    );
  };

  const editor = (
    <div className="tag-editor-root" data-open={isOpen}>
      <button className="tag-editor-scrim" type="button" aria-label="关闭编辑标签" onClick={requestClose} />
      <form className="tag-editor-drawer" onSubmit={handleSubmit}>
        <div className="tag-editor-scroll">
          <header className="tag-editor-header">
          <div>
            <Tag size={23} />
            <div>
              <h2>编辑标签</h2>
              <p>{isDirty ? '未保存更改' : '专辑级批量标签'}</p>
            </div>
          </div>
          <button className="tag-editor-close" type="button" aria-label="关闭编辑标签" onClick={requestClose}>
            <X size={22} />
          </button>
        </header>

        <section className="tag-editor-cover-card" aria-label="当前专辑">
          <div className="tag-editor-cover" data-empty={!previewCover}>
            {previewCover ? <img alt="" src={previewCover} /> : <Disc3 size={42} />}
          </div>
          <div className="tag-editor-file">
            <span className="tag-editor-kicker">当前专辑</span>
            <strong>{album.title}</strong>
            <span>{album.albumArtist}</span>
            <small>
              {album.trackCount} 首 / {formatDuration(album.duration)}
              {selectedCover
                ? ` / 本地封面：${selectedCover.path}`
                : pendingNetworkCover
                  ? ' / 网络封面将在保存时下载并写入'
                  : loadedCoverThumb
                    ? ' / 已从内嵌标签重新载入封面'
                    : ''}
            </small>
            <div className="tag-editor-tool-row">
              <button type="button" onClick={() => void handleChooseCover()} disabled={isBusy}>
                <ImagePlus size={17} />
                选择封面
              </button>
              <button type="button" onClick={() => void handleLoadEmbedded()} disabled={isBusy}>
                <RefreshCw size={17} />
                {isLoadingEmbedded ? '读取中' : '从内嵌标签加载'}
              </button>
              <button type="button" onClick={() => void handleSearchNetwork()} disabled={isBusy}>
                <CloudDownload size={17} />
                {isSearchingNetwork ? '搜索中' : '从网络加载'}
              </button>
            </div>
          </div>
        </section>

        <section className="tag-editor-section">
          <div className="tag-editor-section-heading">
            <h3>专辑信息</h3>
            <span>会批量写入这张专辑内的歌曲</span>
          </div>
          <div className="tag-editor-grid">
            <label className="tag-editor-field">
              <span>专辑</span>
              <input disabled={isBusy} value={form.album} aria-label="专辑" onChange={(event) => updateField('album', event.target.value)} />
            </label>
            <label className="tag-editor-field">
              <span>专辑艺术家</span>
              <input
                disabled={isBusy}
                value={form.albumArtist}
                aria-label="专辑艺术家"
                onChange={(event) => updateField('albumArtist', event.target.value)}
              />
            </label>
            <label className="tag-editor-field" data-invalid={Boolean(yearError)}>
              <span>年份</span>
              <input
                disabled={isBusy}
                inputMode="numeric"
                value={form.year}
                aria-invalid={Boolean(yearError)}
                aria-label="年份"
                onChange={(event) => updateField('year', event.target.value)}
              />
              {yearError ? <em>{yearError}</em> : null}
            </label>
            <label className="tag-editor-field">
              <span>流派</span>
              <input disabled={isBusy} value={form.genre} aria-label="流派" onChange={(event) => updateField('genre', event.target.value)} />
            </label>
          </div>
        </section>

        <section className="tag-editor-section tag-editor-network-panel" aria-label="网络候选对比">
          <div className="tag-editor-section-heading">
            <h3>网络候选</h3>
            <button type="button" onClick={() => void handleSearchNetwork()} disabled={isBusy}>
              <CloudDownload size={16} />
              {isSearchingNetwork ? '搜索中' : '搜索候选'}
            </button>
          </div>

          {networkMessage ? <p className="tag-editor-network-message">{networkMessage}</p> : null}

          {networkCandidates.length ? (
            <div className="tag-editor-network-content">
              <div className="tag-editor-network-list">
                {networkCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    className="tag-editor-network-candidate"
                    type="button"
                    data-selected={selectedNetworkCandidate?.id === candidate.id}
                    onClick={() => handleSelectNetworkCandidate(candidate)}
                  >
                    <span className="tag-editor-network-cover" data-empty={!candidate.coverPreviewUrl}>
                      {candidate.coverPreviewUrl ? <img alt="" src={candidate.coverPreviewUrl} /> : <Tag size={24} />}
                    </span>
                    <span className="tag-editor-network-copy">
                      <strong>{candidate.album || candidate.title || '未知专辑'}</strong>
                      <em>{candidate.albumArtist || candidate.artist || '未知艺术家'}</em>
                      <small>{[candidate.year, candidate.genre].filter(Boolean).join(' / ') || '专辑候选'}</small>
                    </span>
                    <span className="tag-editor-network-score">
                      <b>{candidate.provider}</b>
                      <em>{Math.round(candidate.confidence * 100)}%</em>
                    </span>
                  </button>
                ))}
              </div>

              {selectedNetworkCandidate ? (
                <div className="tag-editor-network-fields">
                  <div className="tag-editor-network-fields-header">
                    <span>选择要应用到专辑的字段</span>
                    <label>
                      <input
                        ref={(node) => {
                          if (node) {
                            node.indeterminate = someNetworkFieldsSelected(networkFieldSelection) && !allNetworkFieldsSelected(networkFieldSelection);
                          }
                        }}
                        type="checkbox"
                        checked={allNetworkFieldsSelected(networkFieldSelection)}
                        onChange={handleToggleAllNetworkFields}
                      />
                      <span>全选</span>
                    </label>
                  </div>

                  <div className="tag-editor-compare-table">
                    <div className="tag-editor-compare-head">
                      <span>字段</span>
                      <span>当前</span>
                      <span>候选</span>
                    </div>
                    {networkFieldLabels.map((field) => {
                      const candidateValue = field.key === 'cover' ? (selectedNetworkCandidate.coverUrl ? '网络封面' : '') : candidateFieldValue(selectedNetworkCandidate, field.key);
                      const currentValue = field.key === 'cover' ? (previewCover ? '已有封面' : '') : form[field.key];
                      const canApply = field.key === 'cover' ? Boolean(selectedNetworkCandidate.coverUrl) : hasFormValue(candidateValue);
                      return (
                        <label key={field.key} className="tag-editor-compare-row" data-disabled={!canApply}>
                          <span>
                            <input
                              type="checkbox"
                              disabled={!canApply}
                              checked={networkFieldSelection[field.key] && canApply}
                              onChange={() => handleToggleNetworkField(field.key)}
                            />
                            {field.label}
                          </span>
                          <em>{fieldValue(currentValue)}</em>
                          <strong>{fieldValue(candidateValue)}</strong>
                        </label>
                      );
                    })}
                  </div>

                  <button type="button" onClick={handleApplyNetworkCandidate} disabled={isSaving || !someNetworkFieldsSelected(networkFieldSelection)}>
                    <Check size={17} />
                    应用到表单
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {error || localError ? <p className="tag-editor-error">{error ?? localError}</p> : null}

        {showDiscardConfirm ? (
          <div className="tag-editor-discard" role="alert">
            <span>有未保存更改，确认关闭并丢弃吗？</span>
            <button type="button" onClick={() => setShowDiscardConfirm(false)}>
              继续编辑
            </button>
            <button type="button" onClick={onClose}>
              丢弃更改
            </button>
          </div>
        ) : null}

          <footer className="tag-editor-actions">
          <span>保存会写入这张专辑内所有歌曲的嵌入标签，并立即同步媒体库。</span>
          <button className="tag-editor-cancel" type="button" onClick={requestClose} disabled={isSaving}>
            取消
          </button>
          <button className="tag-editor-save" type="submit" disabled={isSaving || Boolean(yearError)}>
            <Save size={18} />
            {isSaving ? '保存中' : '保存标签'}
          </button>
          </footer>
        </div>
      </form>
    </div>
  );

  return createPortal(editor, document.body);
};
