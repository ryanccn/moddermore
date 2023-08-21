import Head from "next/head";
import { useRouter } from "next/router";
import { Spinner } from "./partials/Spinner";

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
          <title>{title ? `${title} / Moddermore` : "Fetching data..."}</title>
        </Head>
      )}
      <div className="flex flex-col items-center gap-y-6">
        <Spinner className="block w-8 h-8 fill-indigo-500 dark:fill-indigo-400 mb-4" />
        <span
          className={!label ? "sr-only" : "text-neutral-700 dark:text-neutral-300"}
        >
          {label ?? "Fetching data"}
        </span>
      </div>
    </div>
  );
};
