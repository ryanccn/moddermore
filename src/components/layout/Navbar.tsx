import ModdermoreIcon from '../../../public/icons/moddermore-negative.png';

import Image from 'next/image';
import Link from 'next/link';
import { PlusIcon, UserIcon } from '@heroicons/react/20/solid';

import { useSession, signIn as nextAuthSignIn } from 'next-auth/react';

const Navbar = () => {
  const { data, status } = useSession();

  return (
    <nav
      className={'flex w-full items-center justify-between px-6 py-4 shadow-sm'}
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
          href={data ? '/lists' : '/'}
          className="text-2xl font-bold text-neutral-800 dark:text-neutral-200"
        >
          Moddermore
        </Link>
      </div>

      <div className="flex items-center gap-x-2">
        {status !== 'loading' ? (
          data ? (
            <>
              <Link href="/new" className="mm-button">
                <PlusIcon className="block h-5 w-5" />
                <span>Create</span>
              </Link>
            </>
          ) : (
            <button
              className="mm-button"
              onClick={() => {
                nextAuthSignIn();
              }}
            >
              <UserIcon className="block h-5 w-5" />
              <span>Sign in</span>
            </button>
          )
        ) : (
          <div className="mm-button skeleton bg-neutral-300 px-16 dark:bg-neutral-700">
            &nbsp;
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navbar };
