import { useMemo, type ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { HeartIcon, ListIcon } from "lucide-react";
import { GlobalLayout } from "./GlobalLayout";
import ModdermoreIcon from "../../../public/icons/moddermore-negative.png";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "~/components/shadcn/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/shadcn/avatar";
import { Badge } from "~/components/shadcn/badge";

interface Props {
  title: string;
  children: ReactNode;
}

export const DashboardLayout = ({ title, children }: Props) => {
  const router = useRouter();

  const { data } = useSession({ required: true });
  const isAdmin = useMemo(() => data?.extraProfile.isAdmin === true, [data]);

  return (
    <GlobalLayout title={title} displayTitle={false} displayHeader={false} wideLayout>
      <SidebarProvider>
        <div className="flex w-full flex-col md:flex-row">
          <Sidebar collapsible="none" className="p-4">
            <SidebarHeader className="mb-4">
              <Link href="/" className="flex items-center gap-x-2">
                <Image src={ModdermoreIcon} width="24" height="24" className="rounded-full" alt="" />
                <span className="font-display text-lg font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
                  Moddermore
                </span>
                {isAdmin && <Badge>Admin</Badge>}
              </Link>
            </SidebarHeader>

            <SidebarContent>
              <SidebarMenuButton asChild isActive={router.pathname.startsWith("/lists")}>
                <Link href="/lists">
                  <ListIcon /> Lists
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild isActive={router.pathname.startsWith("/likes")}>
                <Link href="/likes">
                  <HeartIcon /> Likes
                </Link>
              </SidebarMenuButton>
            </SidebarContent>

            <SidebarFooter>
              <Link href="/account" className="flex flex-row items-center gap-x-2">
                <Avatar>
                  <AvatarImage
                    src={data?.extraProfile.profilePicture ?? ""}
                    alt={data?.extraProfile.name ?? ""}
                  />

                  <AvatarFallback>
                    {data?.extraProfile.name
                      ?.split(" ")
                      .map((c) => c[0].toUpperCase())
                      .slice(0, 2)
                      .join("") ?? "?"}
                  </AvatarFallback>
                </Avatar>

                <span className="font-semibold">
                  {data?.extraProfile.name ?? data?.user.name ?? data?.user.email}
                </span>
              </Link>
            </SidebarFooter>
          </Sidebar>

          <div className="w-full px-6 py-12">{children}</div>
        </div>
      </SidebarProvider>
    </GlobalLayout>
  );
};
