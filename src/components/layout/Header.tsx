"use client";

import ModdermoreIcon from "../../../public/icons/moddermore-negative.png";

import { HeartIcon, LaptopIcon, ListIcon, MoonIcon, PlusIcon, SunIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "../shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";

import { signIn as nextAuthSignIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";

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
    <Button size="icon" variant="ghost" onClick={nextTheme} className="p-2">
      {theme === "system" ? <LaptopIcon /> : theme === "light" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

const Header = () => {
  const pathname = usePathname();
  const { data, status } = useSession();
  const isAdmin = useMemo(() => data?.extraProfile.isAdmin === true, [data]);

  return (
    <nav className="flex w-full flex-col gap-8 border-b border-b-neutral-200 px-6 py-4 md:flex-row md:items-center md:justify-between dark:border-b-neutral-800">
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        <Link
          href={data && pathname !== "/lists" ? "/lists" : "/"}
          className="flex items-center gap-x-2 px-2 py-1"
        >
          <Image src={ModdermoreIcon} width="32" height="32" className="rounded-full" alt="" />
          <span className="font-display text-xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-200">
            Moddermore
          </span>
          {isAdmin && (
            <div className="ml-1 rounded-sm bg-sky-400 px-1.5 py-0.5 text-xs font-semibold text-white">
              Admin
            </div>
          )}
        </Link>

        <div className="font-display flex flex-row flex-wrap items-center gap-x-2 font-medium">
          <Link
            className="rounded-sm px-4 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            href="/search"
          >
            Search
          </Link>
          <Link
            className="rounded-sm px-4 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            href="/changelog"
          >
            Changelog
          </Link>

          <ThemeButton />
        </div>
      </div>

      {status === "loading" ? (
        <></>
      ) : data ? (
        <div className="flex flex-row items-center gap-x-4">
          <Button asChild>
            <Link href="/lists/new">
              <PlusIcon />
              <span>Create</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage
                  src={data.extraProfile.profilePicture ?? undefined}
                  width={32}
                  height={32}
                  alt={data.extraProfile.name ?? data.user.email}
                />

                <AvatarFallback>
                  {data.extraProfile.name
                    ?.split(" ")
                    .map((c) => c[0].toUpperCase())
                    .slice(0, 2)
                    .join("") ?? "?"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/lists">
                    <ListIcon />
                    Lists
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/likes">
                    <HeartIcon />
                    Likes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <UserIcon />
                    Account
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
