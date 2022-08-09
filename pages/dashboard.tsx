import type { NextPage } from 'next';

import { useEffect, useState } from 'react';

import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { getUserLists } from '~/lib/supabase';
import { loaderFormat } from '~/lib/strings';

import { useUserMore } from '~/hooks/useUserMore';
import { useRequireAuth } from '~/hooks/useRequireAuth';

import Link from 'next/link';
import { FullLoadingScreen } from '~/components/FullLoadingScreen';
import { GlobalLayout } from '~/components/layout/GlobalLayout';

import type { ModList } from '~/types/moddermore';

const Dashboard: NextPage = () => {
  useRequireAuth();

  const { username, user } = useUserMore(supabaseClient);
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (user) {
      getUserLists(supabaseClient).then(setLists);
    }
  }, [user]);

  if (!user || !username || !lists) {
    return <FullLoadingScreen title="Dashboard" />;
  }

  return (
    <GlobalLayout
      title="Dashboard"
      displayTitle={`Welcome to Moddermore, ${username}`}
    >
      {lists.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lists.map((list) => (
            <Link href={`/list/${list.id}`} key={list.id}>
              <a className="group flex flex-col space-y-2 rounded-sm bg-transparent p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <h2 className="text-lg font-semibold">{list.title}</h2>
                <div className="data-list text-sm">
                  <p>
                    For Minecraft <strong>{list.gameVersion}</strong> with{' '}
                    <strong>{loaderFormat(list.modloader)}</strong>
                  </p>
                  <p>
                    Created on{' '}
                    <strong>{new Date(list.created_at).toDateString()}</strong>
                  </p>
                </div>
              </a>
            </Link>
          ))}
        </ul>
      ) : (
        <div className="rounded bg-transparent p-8 text-center text-lg shadow dark:bg-zinc-800">
          No lists yet!
        </div>
      )}
    </GlobalLayout>
  );
};

export default Dashboard;
