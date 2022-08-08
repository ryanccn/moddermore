import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';

import Link from 'next/link';
import { ExternalLinkIcon, PlusIcon, UserIcon } from '@heroicons/react/outline';
import clsx from 'clsx';

const Navbar = ({ isLandingPage = false }: { isLandingPage?: boolean }) => {
  const { user, isLoading } = useUser();

  const signOut = useCallback(() => {
    supabaseClient.auth.signOut();
  }, []);

  return (
    <nav
      className={clsx([
        'flex w-full items-center justify-between shadow-sm',
        isLandingPage ? 'mb-24 bg-transparent py-4' : 'px-6 py-4',
      ])}
    >
      <div className="flex items-center space-x-2">
        <Link href={user ? '/dashboard' : '/'}>
          <a className="text-2xl font-bold">Moddermore</a>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        {!isLoading ? (
          user ? (
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
                <ExternalLinkIcon className="block h-5 w-5" />
                <span>Sign out</span>
              </button>
            </>
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
  );
};

export { Navbar };
