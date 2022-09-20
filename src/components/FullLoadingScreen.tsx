import Head from 'next/head';
import { useRouter } from 'next/router';
import { Spinner } from './partials/Spinner';

export const FullLoadingScreen = ({
  title,
  label,
}: {
  title?: string;
  label?: string;
}) => {
  const { isFallback } = useRouter();

  return (
    <div className="min-w-screen grid min-h-screen place-items-center">
      {(isFallback || title) && (
        <Head>
          <title>{title ? `${title} / Moddermore` : 'Fetching data...'}</title>
        </Head>
      )}
      <div className="flex flex-col items-center space-y-6">
        <Spinner className="mb-4" />
        <span
          className={!label ? 'sr-only' : 'text-zinc-700 dark:text-zinc-300'}
        >
          {label ?? 'Fetching data'}
        </span>
      </div>
    </div>
  );
};
