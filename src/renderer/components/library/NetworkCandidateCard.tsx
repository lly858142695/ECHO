import { Check, ShieldCheck, X } from 'lucide-react';
import type { LibraryTrack, NetworkMetadataCandidate } from '../../../shared/types/library';
import { useI18n } from '../../i18n/I18nProvider';

type Props = {
  candidate: NetworkMetadataCandidate;
  track: LibraryTrack;
  onApplyMissingOnly: (candidateId: string) => void;
  onApplySelected: (candidateId: string) => void;
  onReject: (candidateId: string) => void;
};

const fieldPairs: Array<['title' | 'artist' | 'album' | 'albumArtist' | 'year' | 'genre' | 'trackNo' | 'discNo', string]> = [
  ['title', 'Title'],
  ['artist', 'Artist'],
  ['album', 'Album'],
  ['albumArtist', 'Album artist'],
  ['year', 'Year'],
  ['genre', 'Genre'],
  ['trackNo', 'Track'],
  ['discNo', 'Disc'],
];

export const NetworkCandidateCard = ({ candidate, track, onApplyMissingOnly, onApplySelected, onReject }: Props): JSX.Element => {
  const { t } = useI18n();
  const diffs = fieldPairs.filter(([key]) => candidate[key] !== null && String(candidate[key]) !== String(track[key] ?? ''));

  return (
    <article className="network-candidate-card">
      <header>
        <strong>{candidate.title ?? track.title}</strong>
        <span>{candidate.provider}</span>
        <em>{candidate.score.toFixed(3)}</em>
      </header>
      <div className="network-diff-grid">
        {diffs.map(([key, label]) => (
          <span key={key}>
            <em>{label}</em>
            <strong>{String(track[key] ?? 'missing')}</strong>
            <b>{String(candidate[key] ?? '')}</b>
          </span>
        ))}
      </div>
      <footer>
        <button type="button" className="settings-action-button" onClick={() => onApplyMissingOnly(candidate.id)}>
          <ShieldCheck size={15} />
          {t('settings.library.networkPanel.applyMissingOnly')}
        </button>
        <button type="button" className="settings-action-button" onClick={() => onApplySelected(candidate.id)}>
          <Check size={15} />
          {t('settings.library.networkPanel.applySelected')}
        </button>
        <button type="button" className="settings-danger-button" onClick={() => onReject(candidate.id)}>
          <X size={15} />
          {t('settings.library.networkPanel.reject')}
        </button>
      </footer>
    </article>
  );
};
