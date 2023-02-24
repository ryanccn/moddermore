import clsx from 'clsx';

export const ProBadge = ({ className }: { className?: string }) => {
  return (
    <span
      className={clsx(
        'inline-block w-auto self-start rounded-full bg-gradient-to-br from-indigo-500 to-green-500 px-2 py-0.5 text-xs font-bold uppercase text-white',
        className
      )}
    >
      Pro
    </span>
  );
};
