import { useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { getUsername } from '~/lib/supabase';

export const useUserMore = () => {
  const { user, isLoading, error } = useUser();
  const [asdf, setASDF] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isLoading && user) {
        const un = await getUsername(user);
        setASDF(un);
      }
    })();
  }, [user, isLoading]);

  return { user, isLoading, error, username: asdf };
};
