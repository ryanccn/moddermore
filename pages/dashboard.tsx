import type { NextPage } from 'next';

import { useEffect, useState } from 'react';
import { useUserMore } from '~/hooks/useUserMore';
import { useRequireAuth } from '~/hooks/useRequireAuth';

import GlobalLayout from '~/components/GlobalLayout';

import type { ModList } from '~/types/moddermore';
import { getUserLists } from '~/lib/supabase';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';

const Dashboard: NextPage = () => {
  useRequireAuth();

  const { username, isLoading, user } = useUserMore();
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserLists().then(setLists);
  }, [user]);

  return (
    <GlobalLayout
      title="Dashboard"
      displayTitle={
        !username
          ? 'Welcome to Moddermore'
          : `Welcome to Moddermore, ${username}`
      }
    >
      {JSON.stringify(lists)}
    </GlobalLayout>
  );
};

export default Dashboard;
