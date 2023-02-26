/* eslint-disable @next/next/no-img-element */

import Head from 'next/head';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

import { ReactNode, useEffect, useState } from 'react';

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
  const derivedTitle = titleSuffix ? `${title} / Moddermore` : title;

  const [showDowntimeMessage, setShowDowntimeMessage] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('downtimeMessageViewed-2-26')) {
      setShowDowntimeMessage(true);
      localStorage.setItem('downtimeMessageViewed-2-26', 'true');
    }
  }, []);

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
        <meta property="og:image" content="https://moddermore.net/e.png" />
        <meta name="twitter:image" content="https://moddermore.net/e.png" />
      </Head>

      <Navbar isLandingPage={isLandingPage} />

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

      {showDowntimeMessage && (
        <div className="fixed bottom-0 right-0 m-6 flex max-w-md rounded-lg bg-red-100 p-6 text-sm font-medium dark:bg-red-900">
          Our main database has gone down and there has been significant data
          loss. We are actively trying to recover this data. Meanwhile, we have
          moved to a new database cluster so you can continue using this
          service.
        </div>
      )}

      <Footer isLandingPage={isLandingPage} />
    </>
  );
};
