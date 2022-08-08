import Head from 'next/head';
import { useRouter } from 'next/router';
import Spinner from './Spinner';

export default function FullLoadingScreen({ title }: { title?: string }) {
  const { isFallback } = useRouter();

  return (
    <div className="min-w-screen grid min-h-screen place-items-center">
      {(isFallback || title) && (
        <Head>
          <title>{title ? `${title} / Moddermore` : 'Fetching data...'}</title>
        </Head>
      )}
      <div className="flex flex-col items-center">
        <Spinner className="mb-4" />
        <span className="sr-only">Fetching data</span>
      </div>
    </div>
  );
}
