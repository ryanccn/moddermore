import type { NextPage } from 'next';

import { useEffect, useState } from 'react';

import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { getUserLists } from '~/lib/supabase';
import { useUserMore } from '~/hooks/useUserMore';
import { useRequireAuth } from '~/hooks/useRequireAuth';

import FullLoadingScreen from '~/components/FullLoadingScreen';
import GlobalLayout from '~/components/GlobalLayout';

import type { ModList } from '~/types/moddermore';

const Dashboard: NextPage = () => {
  useRequireAuth();

  const { username, isLoading, user } = useUserMore(supabaseClient);
  const [lists, setLists] = useState<ModList[] | null>(null);

  useEffect(() => {
    if (user) {
      getUserLists(supabaseClient).then(setLists);
    }
  }, [user]);

  if (!user) {
    return <FullLoadingScreen />;
  }

  return (
    <GlobalLayout
      title="Dashboard"
      displayTitle={`Welcome to Moddermore, ${username}`}
    >
      {JSON.stringify(lists)}
    </GlobalLayout>
  );
};

export default Dashboard;
