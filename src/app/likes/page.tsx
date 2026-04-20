"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { ModListInList } from "~/components/partials/ModListInList";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/shadcn/empty";
import { Skeleton } from "~/components/shadcn/skeleton";
import { HeartIcon } from "lucide-react";

import { toast } from "sonner";
import type { ModList } from "~/types/moddermore";

export default function LikesPage() {
  const session = useSession({ required: true });
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (session.data && session.data.user.id) {
      fetch("/api/likes/list")
        .then((a) => a.json() as Promise<ModList[]>)
        .then(setLists)
        .catch(() => {
          toast.error("Failed to fetch lists!");
        });
    }
  }, [session]);

  return (
    <GlobalLayout title="Likes" wideLayout>
      {lists ? (
        lists.length > 0 ? (
          <ul className="grid h-fit w-full grid-cols-1 gap-4 lg:grid-cols-3">
            {lists.map((list) => (
              <ModListInList list={list} key={list.id} />
            ))}
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HeartIcon />
              </EmptyMedia>
              <EmptyTitle>No liked lists</EmptyTitle>
              <EmptyDescription>No liked lists yet!</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      ) : (
        <ul className="grid h-fit grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton style={{ height: "10rem" }} />
          <Skeleton style={{ height: "10rem" }} />
          <Skeleton style={{ height: "10rem" }} />
          <Skeleton style={{ height: "10rem" }} />
          <Skeleton style={{ height: "10rem" }} />
          <Skeleton style={{ height: "10rem" }} />
        </ul>
      )}
    </GlobalLayout>
  );
}
