import type { NextPage } from 'next';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import { DashboardLayout } from '~/components/layout/DashboardLayout';
import { ModListInList } from '~/components/partials/ModListInList';

import type { ModList } from '~/types/moddermore';
import toast from 'react-hot-toast';

const Dashboard: NextPage = () => {
  const session = useSession({ required: true });
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (session.data && session.data.user.id) {
      fetch('/api/list/ownLists')
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
          <ul className="grid h-fit w-full grid-cols-1 gap-4 px-6 lg:grid-cols-3">
            {lists.map((list) => (
              <ModListInList list={list} key={list.id} />
            ))}
          </ul>
        ) : (
          <div className="rounded h-fit m-6 bg-transparent font-medium px-2 py-16 text-center text-lg shadow dark:bg-neutral-800">
            No lists yet!
          </div>
        )
      ) : (
        <ul className="grid h-fit m-6 grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="skeleton" style={{ height: '8rem' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
        </ul>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
