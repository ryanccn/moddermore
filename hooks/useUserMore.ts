import { useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { getUsername } from '~/lib/supabase';

import { type SupabaseClient } from '@supabase/supabase-js';

export const useUserMore = (client: SupabaseClient) => {
  const { user, isLoading: isFirstStepLoading, error } = useUser();
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!isFirstStepLoading && user) {
        const un = await getUsername(client, user.id);
        setUsername(un);
        setIsLoading(false);
      }
    })();
  }, [user, isFirstStepLoading, client]);

  return { user, username, isLoading, error };
};
