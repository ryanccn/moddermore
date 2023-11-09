import type { NextPage } from "next";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { ModListInList } from "~/components/partials/ModListInList";

import toast from "react-hot-toast";
import type { ModList } from "~/types/moddermore";

const Dashboard: NextPage = () => {
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
    <DashboardLayout title="Lists">
      {lists ? (
        lists.length > 0 ? (
          <ul className="grid h-fit w-full grid-cols-1 gap-4 lg:grid-cols-3">
            {lists.map((list) => (
              <ModListInList list={list} key={list.id} />
            ))}
          </ul>
        ) : (
          <div className="rounded bg-neutral-50 px-2 py-24 text-center font-display text-lg font-medium text-black/50 shadow dark:bg-neutral-800 dark:text-white/50">
            No lists yet!
          </div>
        )
      ) : (
        <ul className="grid h-fit grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="skeleton" style={{ height: "10rem" }} />
          <div className="skeleton" style={{ height: "10rem" }} />
          <div className="skeleton" style={{ height: "10rem" }} />
          <div className="skeleton" style={{ height: "10rem" }} />
          <div className="skeleton" style={{ height: "10rem" }} />
          <div className="skeleton" style={{ height: "10rem" }} />
        </ul>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
