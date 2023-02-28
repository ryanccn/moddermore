import type { NextPage } from 'next';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import { DashboardLayout } from '~/components/layout/DashboardLayout';
import { ModListInList } from '~/components/partials/ModListInList';

import type { ModList } from '~/types/moddermore';
import toast from 'react-hot-toast';

const LikesPage: NextPage = () => {
  const session = useSession({ required: true });
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (session.data && session.data.user.id) {
      fetch('/api/likes/list')
        .then((a) => a.json() as Promise<ModList[]>)
        .then(setLists)
        .catch(() => {
          toast.error('Failed to fetch lists!');
        });
    }
  }, [session]);

  return (
    <DashboardLayout title="Lists">
      {lists ? (
        lists.length > 0 ? (
          <ul className="flex w-full flex-col gap-4 px-6">
            {lists.map((list) => (
              <ModListInList list={list} key={list.id} />
            ))}
          </ul>
        ) : (
          <div className="rounded bg-transparent p-8 text-center text-lg shadow dark:bg-neutral-800">
            No liked lists yet!
          </div>
        )
      ) : (
        <div className="w-full" />
      )}
    </DashboardLayout>
  );
};

export default LikesPage;
