import { useCallback } from 'react';

import Link from 'next/link';
import { XCircleIcon, PlusIcon, UserIcon } from '@heroicons/react/20/solid';

import clsx from 'clsx';

import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';

const Navbar = ({ isLandingPage = false }: { isLandingPage?: boolean }) => {
  const { data, status } = useSession();

  const signOut = useCallback(() => {
    nextAuthSignOut();
  }, []);

  return (
    <nav
      className={clsx([
        'flex w-full items-center justify-between shadow-sm',
        isLandingPage ? 'mb-40 bg-transparent py-4' : 'px-6 py-4',
      ])}
    >
      <div className="flex items-center space-x-2">
        <Link href={data ? '/dashboard' : '/'}>
          <a className="text-2xl font-bold">Moddermore</a>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        {status !== 'loading' ? (
          data ? (
            <>
              <Link href="/new">
                <a className="primaryish-button">
                  <PlusIcon className="block h-5 w-5" />
                  <span>Create</span>
                </a>
              </Link>
              <button
                className="primaryish-button bg-transparent hover:bg-red-500/10 hover:text-red-400 hover:brightness-100 focus:ring-red-400/40"
                onClick={signOut}
              >
                <XCircleIcon className="block h-5 w-5" />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <button
              className="primaryish-button"
              onClick={() => {
                nextAuthSignIn();
              }}
            >
              <UserIcon className="block h-5 w-5" />
              <span>Sign in / Sign up</span>
            </button>
          )
        ) : (
          <div className="primaryish-button skeleton bg-zinc-300 px-16 dark:bg-zinc-700">
            &nbsp;
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navbar };
