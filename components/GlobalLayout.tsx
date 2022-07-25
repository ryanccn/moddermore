import { PlusIcon } from '@heroicons/react/outline';
import Head from 'next/head';
import Link from 'next/link';

import Footer from './Footer';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  titleSuffix?: boolean;
  displayTitle?: boolean;
  children: ReactNode | ReactNode[];
}

export default function GlobalLayout({
  title,
  titleSuffix = true,
  displayTitle = true,
  children,
}: Props) {
  return (
    <>
      <Head>
        <title>{titleSuffix ? `${title} / Moddermore` : title}</title>
      </Head>

      <nav className="mb-28 flex items-center justify-between px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <a className="text-2xl font-bold">Moddermore</a>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/new">
            <a className="primaryish-button">
              <PlusIcon className="block h-5 w-5" />
              <span>Create</span>
            </a>
          </Link>
        </div>
      </nav>

      <main className="layout">
        {displayTitle && <h1 className="title">{title}</h1>}
        {children}
      </main>

      <Footer />
    </>
  );
}
