import type { PropsWithChildren } from 'react';
import { PlaybackQueueProvider } from '../stores/PlaybackQueueProvider';

export const AppProviders = ({ children }: PropsWithChildren): JSX.Element => {
  return <PlaybackQueueProvider>{children}</PlaybackQueueProvider>;
};
