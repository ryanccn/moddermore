import clsx from 'clsx';
import Link from 'next/link';

export const ProBadge = ({ className }: { className?: string }) => {
  return (
    <Link
      className={clsx(
        'inline-block w-auto self-start rounded-full bg-gradient-to-br from-indigo-500 to-green-500 px-2 py-0.5 text-xs font-bold uppercase text-white',
        className
      )}
      href="/pro"
    >
      Pro
    </Link>
  );
};
