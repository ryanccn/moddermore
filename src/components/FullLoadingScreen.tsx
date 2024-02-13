import Head from "next/head";
import { useRouter } from "next/router";
import { Spinner } from "./partials/Spinner";

export const FullLoadingScreen = ({ title, label }: { title?: string; label?: string }) => {
  const { isFallback } = useRouter();

  return (
    <div className="min-w-screen grid min-h-screen place-items-center">
      {(isFallback || title) && (
        <Head>
          <title>{title ? `${title} / Moddermore` : "Fetching data..."}</title>
        </Head>
      )}
      <div className="flex flex-col items-center gap-y-6">
        <Spinner className="mb-4 block h-8 w-8 stroke-indigo-500 dark:stroke-indigo-400" />
        <span className={label ? "text-neutral-700 dark:text-neutral-300" : "sr-only"}>
          {label ?? "Fetching data"}
        </span>
      </div>
    </div>
  );
};
