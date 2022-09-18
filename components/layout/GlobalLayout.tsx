/* eslint-disable @next/next/no-img-element */

import Head from 'next/head';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  titleSuffix?: boolean;
  displayTitle?: boolean | string;
  isLandingPage?: boolean;
  children: ReactNode | ReactNode[];
}

export const GlobalLayout = ({
  title,
  titleSuffix = true,
  displayTitle = true,
  isLandingPage = false,
  children,
}: Props) => {
  const derivedTitle = titleSuffix ? `${title} / Moddermore` : title;

  return (
    <>
      <Head>
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
        <meta
          property="og:image"
          content="https://moddermore.vercel.app/e.png"
        />
        <meta
          name="twitter:image"
          content="https://moddermore.vercel.app/e.png"
        />
      </Head>

      {!isLandingPage ? <Navbar /> : null}

      <main className={!isLandingPage ? 'layout mt-28' : ''}>
        {displayTitle === true ? (
          <h1 className="title">{title}</h1>
        ) : typeof displayTitle === 'string' ? (
          <h1 className="title">{displayTitle}</h1>
        ) : null}
        {children}
      </main>

      <Footer />

      <a
        href="https://www.buymeacoffee.com/ryanccn"
        target="_blank"
        rel="noopener noreferrer"
        className="primaryish-button fixed bottom-0 right-0 m-4 bg-yellow-500 font-['Lobster',_sans-serif] shadow-sm"
      >
        Donate
      </a>
    </>
  );
};
