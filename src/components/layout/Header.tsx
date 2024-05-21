import ModdermoreIcon from "../../../public/icons/moddermore-negative.png";

import { LaptopIcon, MoonIcon, PlusIcon, SunIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/Button";

import { signIn as nextAuthSignIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";

import { twMerge } from "tailwind-merge";

const ThemeButton = () => {
  const { theme, setTheme } = useTheme();
  const [renderSelf, setRenderSelf] = useState(false);

  useEffect(() => {
    setRenderSelf(true);
  }, []);

  const nextTheme = useCallback(() => {
    setTheme(theme === "system" ? "light" : theme === "light" ? "dark" : "system");
  }, [theme, setTheme]);

  if (!renderSelf) return null;

  return (
    <button onClick={nextTheme} className="p-2">
      {theme === "system" ? (
        <LaptopIcon className="block h-5 w-5" />
      ) : theme === "light" ? (
        <SunIcon className="block h-5 w-5" />
      ) : (
        <MoonIcon className="block h-5 w-5" />
      )}
    </button>
  );
};

const Header = () => {
  const { data, status } = useSession();
  const isAdmin = useMemo(() => data?.extraProfile.isAdmin === true, [data]);

  return (
    <nav className="flex w-full flex-col gap-8 border-b border-b-neutral-200 px-6 py-4 dark:border-b-neutral-800 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        <Link href={data ? "/lists" : "/"} className="flex items-center gap-x-2 px-2 py-1">
          <Image src={ModdermoreIcon} width="32" height="32" className="rounded-full" alt="" />
          <span className="font-display text-2xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-200">
            Moddermore
          </span>
          {isAdmin && (
            <div className="ml-1 rounded-sm bg-sky-400 px-1.5 py-0.5 text-xs font-semibold text-white">
              Admin
            </div>
          )}
        </Link>

        <div className="flex flex-row flex-wrap items-center gap-x-2 font-display font-semibold">
          <Link className="px-2 py-1" href="/search">
            Search
          </Link>
          <Link className="px-2 py-1" href="/changelog">
            Changelog
          </Link>

          <ThemeButton />
        </div>
      </div>

      {status === "loading" ? (
        <div
          className={twMerge(
            buttonVariants({
              className: "skeleton bg-neutral-300 px-16 dark:bg-neutral-700",
            }),
          )}
        >
          &nbsp;
        </div>
      ) : data ? (
        <div className="flex flex-row items-center gap-x-4">
          <Link href="/new" className={buttonVariants()}>
            <PlusIcon className="block h-5 w-5" />
            <span>Create</span>
          </Link>
          <Link href="/lists" className="p-1">
            <img
              src={data.extraProfile.profilePicture ?? undefined}
              width={32}
              height={32}
              alt="Lists"
              className="rounded-full bg-neutral-100 dark:bg-neutral-800"
            />
          </Link>
        </div>
      ) : (
        <Button
          onClick={() => {
            nextAuthSignIn().catch((error) => {
              console.error(error);
            });
          }}
        >
          <UserIcon className="block h-5 w-5" />
          <span>Sign in</span>
        </Button>
      )}
    </nav>
  );
};

export { Header };
