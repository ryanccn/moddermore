import { CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export const ProBadge = ({ className }: { className?: string }) => {
  const session = useSession();

  return (
    <Link
      className={clsx(
        'flex w-auto flex-row items-center gap-x-1 rounded-full bg-gradient-to-br from-indigo-500 to-green-500 px-2 py-0.5 text-xs font-bold uppercase text-white',
        className
      )}
      href="/pro"
    >
      {session?.data?.extraProfile.plan === 'pro' && (
        <CheckIcon className="block h-3 w-3" strokeWidth={3} />
      )}
      <span>Pro</span>
    </Link>
  );
};
