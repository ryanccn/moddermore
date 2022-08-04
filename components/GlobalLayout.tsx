import { useUser } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import Link from 'next/link';

import Footer from './Footer';
import { PlusIcon, UserIcon } from '@heroicons/react/outline';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  titleSuffix?: boolean;
  displayTitle?: boolean | string;
  children: ReactNode | ReactNode[];
}

export default function GlobalLayout({
  title,
  titleSuffix = true,
  displayTitle = true,
  children,
}: Props) {
  const { user, isLoading } = useUser();

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
          {!isLoading ? (
            user ? (
              <Link href="/new">
                <a className="primaryish-button">
                  <PlusIcon className="block h-5 w-5" />
                  <span>Create</span>
                </a>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <a className="primaryish-button">
                  <UserIcon className="block h-5 w-5" />
                  <span>Sign in / Sign up</span>
                </a>
              </Link>
            )
          ) : (
            <div className="primaryish-button animate-pulse bg-zinc-300 px-16 dark:bg-zinc-700">
              &nbsp;
            </div>
          )}
        </div>
      </nav>

      <main className="layout">
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
