import ModdermoreIcon from '../../../public/icons/moddermore-negative.png';

import Image from 'next/image';
import Link from 'next/link';
import { Button, buttonVariants } from '../ui/Button';
import {
  LaptopIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react';

import { useCallback, useEffect, useState } from 'react';
import { useSession, signIn as nextAuthSignIn } from 'next-auth/react';
import { useTheme } from 'next-themes';

import { twMerge } from 'tailwind-merge';

const ThemeButton = () => {
  const { theme, setTheme } = useTheme();
  const [renderSelf, setRenderSelf] = useState(false);

  useEffect(() => {
    setRenderSelf(true);
  }, []);

  const nextTheme = useCallback(() => {
    setTheme(
      theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system',
    );
  }, [theme, setTheme]);

  if (!renderSelf) return null;

  return (
    <button onClick={nextTheme} className="p-2">
      {theme === 'system' ? (
        <LaptopIcon className="block w-4 h-4" />
      ) : theme === 'light' ? (
        <SunIcon className="block w-4 h-4" />
      ) : (
        <MoonIcon className="block w-4 h-4" />
      )}
    </button>
  );
};

const Header = () => {
  const { data, status } = useSession();

  return (
    <nav className="flex flex-col md:flex-row w-full md:items-center md:justify-between px-6 py-4 border-b border-b-neutral-200 dark:border-b-neutral-800 gap-8">
      <div className="flex flex-col md:flex-row md:items-center gap-8">
        <Link
          href={data ? '/lists' : '/'}
          className="flex items-center gap-x-2 px-2 py-1"
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

        <div className="flex flex-row flex-wrap items-center gap-x-2">
          <Link className="px-2 py-1 font-medium" href="/blog">
            Blog
          </Link>

          <ThemeButton />
        </div>
      </div>

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
    </nav>
  );
};

export { Header };
