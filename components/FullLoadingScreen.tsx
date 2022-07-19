import Head from 'next/head';
import Spinner from './Spinner';

import { useElapsedTime } from 'use-elapsed-time';

export default function FullLoadingScreen() {
  const { elapsedTime } = useElapsedTime({ isPlaying: true });

  return (
    <div className="min-w-screen grid min-h-screen place-items-center">
      <Head>
        <title>{'Fetching data...'}</title>
      </Head>
      <div className="flex flex-col items-center space-y-1">
        <Spinner className="mb-4" />
        <h2 className="text-lg font-medium">
          Fetching data... {elapsedTime.toFixed(1)}s
        </h2>
        <h3 className="text-zinc-800 dark:text-zinc-200">
          (this only happens once, don&apos;t worry)
        </h3>
      </div>
    </div>
  );
}
