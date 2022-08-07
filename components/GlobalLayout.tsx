import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  titleSuffix?: boolean;
  displayTitle?: boolean | string;
  isLandingPage?: boolean;
  children: ReactNode | ReactNode[];
}

export default function GlobalLayout({
  title,
  titleSuffix = true,
  displayTitle = true,
  isLandingPage = false,
  children,
}: Props) {
  return (
    <>
      <Head>
        <title>{titleSuffix ? `${title} / Moddermore` : title}</title>
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
    </>
  );
}
