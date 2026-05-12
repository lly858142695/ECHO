import {
  Heart,
  ListMusic,
  Mic2,
  Pause,
  Play,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';

type PlayerTransportProps = {
  isPlaying: boolean;
  isShuffleEnabled: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
};

export const PlayerTransport = ({
  isPlaying,
  isShuffleEnabled,
  canGoPrevious,
  canGoNext,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleShuffle,
}: PlayerTransportProps): JSX.Element => (
  <div className="transport">
    <button className="icon-button" type="button" aria-label="播放队列" title="播放队列">
      <ListMusic size={17} />
    </button>
    <button
      className={`icon-button ${isShuffleEnabled ? 'is-soft-active' : ''}`}
      type="button"
      aria-label="随机播放"
      aria-pressed={isShuffleEnabled}
      title="随机播放"
      onClick={onToggleShuffle}
    >
      <Shuffle size={17} />
    </button>
    <button className="icon-button" type="button" aria-label="上一首" title="上一首" disabled={!canGoPrevious} onClick={onPrevious}>
      <SkipBack size={18} />
    </button>
    <button className="play-button" type="button" aria-label={isPlaying ? '暂停' : '播放'} title={isPlaying ? '暂停' : '播放'} onClick={onPlayPause}>
      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
    </button>
    <button className="icon-button" type="button" aria-label="下一首" title="下一首" disabled={!canGoNext} onClick={onNext}>
      <SkipForward size={18} />
    </button>
    <button className="icon-button is-soft-active" type="button" aria-label="循环播放" title="循环播放">
      <Repeat2 size={17} />
    </button>
    <button className="icon-button" type="button" aria-label="歌词" title="歌词">
      <Mic2 size={17} />
    </button>
    <button className="icon-button" type="button" aria-label="喜欢" title="喜欢">
      <Heart size={17} />
    </button>
  </div>
);
