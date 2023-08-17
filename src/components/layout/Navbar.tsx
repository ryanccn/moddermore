import ModdermoreIcon from '../../../public/icons/moddermore-negative.png';

import Image from 'next/image';
import Link from 'next/link';

import { useSession, signIn as nextAuthSignIn } from 'next-auth/react';
import { Button, buttonVariants } from '../ui/Button';
import { twMerge } from 'tailwind-merge';
import { PlusIcon, UserIcon } from 'lucide-react';

const Navbar = () => {
  const { data, status } = useSession();

  return (
    <nav
      className={'flex w-full items-center justify-between px-6 py-4 shadow-sm'}
    >
      <Link
        href={data ? '/lists' : '/'}
        className="flex items-center gap-x-3 p-2"
      >
        <Image
          src={ModdermoreIcon}
          width="32"
          height="32"
          className="rounded-full"
          alt=""
        />
        <span className="text-2xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-200">
          Moddermore
        </span>
      </Link>

      <div className="flex items-center gap-x-2">
        {status !== 'loading' ? (
          data ? (
            <>
              <Link href="/new" className={buttonVariants()}>
                <PlusIcon className="block h-5 w-5" />
                <span>Create</span>
              </Link>
            </>
          ) : (
            <Button
              onClick={() => {
                nextAuthSignIn();
              }}
            >
              <UserIcon className="block h-5 w-5" />
              <span>Sign in</span>
            </Button>
          )
        ) : (
          <div
            className={twMerge(
              buttonVariants({
                className: 'skeleton bg-neutral-300 px-16 dark:bg-neutral-700',
              }),
            )}
          >
            &nbsp;
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navbar };
