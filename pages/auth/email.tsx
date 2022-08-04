import type { NextPage } from 'next';

import { useEffect, useState } from 'react';

import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { getUserLists } from '~/lib/supabase';
import { loaderFormat } from '~/lib/strings';

import { useUserMore } from '~/hooks/useUserMore';
import { useRequireAuth } from '~/hooks/useRequireAuth';

import GlobalLayout from '~/components/GlobalLayout';

const Dashboard: NextPage = () => {
  return (
    <GlobalLayout title="Verification email sent">
      <p>
        Please check your inbox for a verification email. Click the link to
        proceed with registration.
      </p>
    </GlobalLayout>
  );
};

export default Dashboard;
