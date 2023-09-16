/* eslint-disable @next/next/no-img-element */

import Head from "next/head";
import { Footer } from "./Footer";
import { Header } from "./Header";

import { type ReactNode, useMemo } from "react";

import { twMerge } from "tailwind-merge";

interface Props {
  title: string;
  titleSuffix?: boolean;
  titleIcon?: ReactNode;
  className?: string;
  displayTitle?: boolean | string;
  wideLayout?: boolean;
  isAuthPage?: boolean;
  children: ReactNode | ReactNode[];
}

export const GlobalLayout = ({
  title,
  titleSuffix = true,
  titleIcon,
  displayTitle = true,
  wideLayout = false,
  isAuthPage = false,
  className,
  children,
}: Props) => {
  const derivedTitle = useMemo(() => (titleSuffix ? `${title} / Moddermore` : title), [title, titleSuffix]);

  return (
    <>
      <Head>
        <link rel="icon" href="/icons/moddermore-positive.png" />
        <link rel="icon" media="(prefers-color-scheme: dark)" href="/icons/moddermore-mono-white.svg" />
        <link rel="apple-touch-icon" href="/icons/moddermore-negative.png" />
        <meta name="apple-mobile-web-app-title" content="Moddermore" />

        <title>{derivedTitle}</title>

        <meta name="title" content={derivedTitle} />
        <meta name="description" content="Share your mods with anyone." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={derivedTitle} />
        <meta property="og:description" content="Share your mods with anyone." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@RyanCaoDev" />
        <meta property="og:image" content="https://moddermore.net/cover.png" />
        <meta name="twitter:image" content="https://moddermore.net/cover.png" />
      </Head>

      <Header />

      <main
        className={twMerge(
          wideLayout
            ? "flex flex-col"
            : isAuthPage
            ? "layout mt-28 max-w-[45ch] items-center text-center"
            : "layout mt-28",
          className,
        )}
      >
        {displayTitle === true ? (
          <>
            {titleIcon}
            <h1 className="title">{title}</h1>
          </>
        ) : typeof displayTitle === "string" ? (
          <>
            {titleIcon}
            <h1 className="title">{displayTitle}</h1>
          </>
        ) : null}

        {children}
      </main>

      <Footer />
    </>
  );
};
