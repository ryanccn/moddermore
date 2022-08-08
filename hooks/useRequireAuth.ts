import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export const useRequireAuth = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('This page requires authentication.');
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);
};

export const useCantHaveAuth = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);
};
