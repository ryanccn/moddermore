/* eslint-disable @next/next/no-img-element */

import Head from 'next/head';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AdvisoryDrawer } from './AdvisoryDrawer';

import { useMemo, type ReactNode } from 'react';

interface Props {
  title: string;
  titleSuffix?: boolean;
  titleIcon?: ReactNode;
  displayTitle?: boolean | string;
  isLandingPage?: boolean;
  isAuthPage?: boolean;
  children: ReactNode | ReactNode[];
}

export const GlobalLayout = ({
  title,
  titleSuffix = true,
  titleIcon,
  displayTitle = true,
  isLandingPage = false,
  isAuthPage = false,
  children,
}: Props) => {
  const derivedTitle = useMemo(
    () => (titleSuffix ? `${title} / Moddermore` : title),
    [title, titleSuffix]
  );

  return (
    <>
      <Head>
        <link rel="icon" href="/icons/moddermore-positive.png" />
        <link
          rel="icon"
          media="(prefers-color-scheme: dark)"
          href="/icons/moddermore-mono-white.svg"
        />
        <link rel="apple-touch-icon" href="/icons/moddermore-negative.png" />
        <meta name="apple-mobile-web-app-title" content="Moddermore" />

        <title>{derivedTitle}</title>

        <meta name="title" content={derivedTitle} />
        <meta name="description" content="Share your mods with anyone." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={derivedTitle} />
        <meta
          property="og:description"
          content="Share your mods with anyone."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@RyanCaoDev" />
        <meta property="og:image" content="https://moddermore.net/cover.png" />
        <meta name="twitter:image" content="https://moddermore.net/cover.png" />
      </Head>

      <Navbar />

      <main
        className={
          isLandingPage
            ? 'flex flex-col'
            : isAuthPage
            ? 'layout mt-28 max-w-[45ch] items-center text-center'
            : 'layout mt-28'
        }
      >
        {displayTitle === true ? (
          <>
            {titleIcon}
            <h1 className="title">{title}</h1>
          </>
        ) : typeof displayTitle === 'string' ? (
          <>
            {titleIcon}
            <h1 className="title">{displayTitle}</h1>
          </>
        ) : null}
        {children}
      </main>

      <Footer isLandingPage={isLandingPage} />

      <AdvisoryDrawer />
    </>
  );
};
