import type { NextPage } from 'next';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { loaderFormat } from '~/lib/strings';

import Link from 'next/link';
import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { LegacyBadge } from '~/components/partials/LegacyBadge';

import type { ModList } from '~/types/moddermore';
import toast from 'react-hot-toast';

const Dashboard: NextPage = () => {
  const session = useSession({ required: true });
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (session.data && session.data.user.id) {
      fetch('/api/getUserLists')
        .then((a) => a.json())
        .then(setLists)
        .catch(() => {
          toast.error('Failed to fetch lists!');
        });
    }
  }, [session]);

  return (
    <GlobalLayout title="Dashboard" displayTitle={`Welcome to Moddermore`}>
      {lists ? (
        lists.length > 0 ? (
          <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            {lists.map((list) => (
              <Link
                href={`/list/${list.id}`}
                key={list.id}
                className="group flex flex-col space-y-2 rounded-sm bg-transparent p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
          <div className="rounded bg-transparent p-8 text-center text-lg shadow dark:bg-zinc-800">
            No lists yet!
          </div>
        )
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="skeleton" style={{ height: '8rem' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
        </ul>
      )}
    </GlobalLayout>
  );
};

export default Dashboard;
