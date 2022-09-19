import clsx from 'clsx';

export const LegacyBadge = ({ className }: { className?: string }) => {
  return (
    <span
      className={clsx(
        'inline-block w-auto self-start rounded-full bg-red-300/50 px-2 py-1 text-xs font-bold uppercase text-red-500 dark:bg-red-700/50 dark:text-white',
        className
      )}
    >
      Legacy
    </span>
  );
};
