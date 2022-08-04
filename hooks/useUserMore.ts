import { useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { getUsername } from '~/lib/supabase';

import { type SupabaseClient } from '@supabase/supabase-js';

export const useUserMore = (client: SupabaseClient) => {
  const { user, isLoading, error } = useUser();
  const [asdf, setASDF] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isLoading && user) {
        const un = await getUsername(client, user);
        setASDF(un);
      }
    })();
  }, [user, isLoading, client]);

  return { user, isLoading, error, username: asdf };
};
