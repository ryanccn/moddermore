import Head from 'next/head';
import Spinner from './Spinner';

export default function FullLoadingScreen() {
  return (
    <div className="min-w-screen grid min-h-screen place-items-center">
      <Head>
        <title>{'Fetching data...'}</title>
      </Head>
      <div className="flex flex-col items-center">
        <Spinner className="mb-4" />
        <span className="sr-only">Fetching data...</span>
      </div>
    </div>
  );
}
