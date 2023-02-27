import type { NextPage } from 'next';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { loaderFormat } from '~/lib/strings';

import Link from 'next/link';
import { DashboardLayout } from '~/components/layout/DashboardLayout';
import { LegacyBadge } from '~/components/partials/LegacyBadge';

import type { ModList } from '~/types/moddermore';
import toast from 'react-hot-toast';

const Dashboard: NextPage = () => {
  const session = useSession({ required: true });
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (session.data && session.data.user.id) {
      fetch('/api/list/ownLists')
        .then((a) => a.json())
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
              <Link
                href={`/list/${list.customSlug ?? list.id}`}
                key={list.id}
                className="group flex flex-col gap-y-3 rounded-lg bg-transparent p-6 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <h2 className="flex justify-between text-lg font-semibold">
                  <span>{list.title}</span>
                  {list.legacy && <LegacyBadge />}
                </h2>
                <div className="data-list text-sm">
                  <p>
                    For Minecraft <strong>{list.gameVersion}</strong> with{' '}
                    <strong>{loaderFormat(list.modloader)}</strong>
                  </p>
                  <p>
                    Last updated{' '}
                    <strong>{new Date(list.created_at).toDateString()}</strong>
                  </p>
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <div className="rounded bg-transparent p-8 text-center text-lg shadow dark:bg-neutral-800">
            No lists yet!
          </div>
        )
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
