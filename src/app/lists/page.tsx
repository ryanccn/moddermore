"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { ModListInList } from "~/components/partials/ModListInList";
import Link from "next/link";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/shadcn/empty";
import { Button } from "~/components/shadcn/button";
import { Skeleton } from "~/components/shadcn/skeleton";
import { ListIcon, PlusIcon } from "lucide-react";

import { toast } from "sonner";
import type { ModList } from "~/types/moddermore";

export default function DashboardPage() {
  const session = useSession({ required: true });
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (session.data && session.data.user.id) {
      fetch("/api/list/ownLists")
        .then((a) => a.json() as Promise<ModList[]>)
        .then(setLists)
        .catch(() => {
          toast.error("Failed to fetch lists!");
        });
    }
  }, [session]);

  return (
    <GlobalLayout title="Lists" wideLayout>
      {lists ? (
        lists.length > 0 ? (
          <ul className="grid h-fit w-full grid-cols-1 gap-4 lg:grid-cols-3">
            {lists.map((list) => (
              <ModListInList list={list} key={list.id} />
            ))}
            <Button
              className="size-full min-h-48 border border-dashed border-neutral-200 dark:border-neutral-800"
              size="lg"
              variant="ghost"
              asChild
            >
              <Link href="/lists/new">
                <PlusIcon />
                Create new list
              </Link>
            </Button>
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListIcon />
              </EmptyMedia>
              <EmptyTitle>No lists</EmptyTitle>
              <EmptyDescription>No lists found!</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/lists/new">Create new list</Link>
              </Button>
            </EmptyContent>
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
