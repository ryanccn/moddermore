import ModdermoreIcon from '~/moddermore.png';

import Image from 'next/image';
import Link from 'next/link';
import { PlusIcon, UserIcon } from '@heroicons/react/20/solid';

import clsx from 'clsx';

import { useSession, signIn as nextAuthSignIn } from 'next-auth/react';

const Navbar = ({ isLandingPage = false }: { isLandingPage?: boolean }) => {
  const { data, status } = useSession();

  return (
    <nav
      className={clsx([
        'flex w-full items-center justify-between px-6 py-4 shadow-sm',
        isLandingPage ? 'bg-transparent' : null,
      ])}
    >
      <div className="flex items-center gap-x-3">
        <Image
          src={ModdermoreIcon}
          width="32"
          height="32"
          className="rounded-full"
          alt="Moddermore icon"
        />
        <Link
          href={data ? '/dashboard' : '/'}
          className="text-2xl font-bold text-neutral-800 dark:text-neutral-200"
        >
          Moddermore
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        {status !== 'loading' ? (
          data ? (
            <>
              <Link href="/new" className="primaryish-button">
                <PlusIcon className="block h-5 w-5" />
                <span>Create</span>
              </Link>
              <Link
                className="primaryish-button secondaryish-instead"
                href="/account"
              >
                <UserIcon className="block h-5 w-5" />
                <span>Manage account</span>
              </Link>
            </>
          ) : (
            <button
              className="primaryish-button"
              onClick={() => {
                nextAuthSignIn();
              }}
            >
              <UserIcon className="block h-5 w-5" />
              <span>Sign in</span>
            </button>
          )
        ) : (
          <div className="primaryish-button skeleton bg-neutral-300 px-16 dark:bg-neutral-700">
            &nbsp;
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navbar };
