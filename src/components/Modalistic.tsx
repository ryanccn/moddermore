import { Root as Portal } from '@radix-ui/react-portal';
import clsx from 'clsx';

import { type ReactNode } from 'react';

export const Modalistic = ({
  className,
  backdropClickHandler,
  children,
}: {
  className?: string;
  backdropClickHandler?: () => void | Promise<void>;
  children: ReactNode | ReactNode[];
}) => {
  return (
    <Portal container={document.body}>
      <div
        className="fixed inset-0 bg-white/75 backdrop-blur-md dark:bg-neutral-900/75"
        onClick={backdropClickHandler}
      />

      <div
        className={clsx(
          'fixed top-1/2 left-1/2 z-[88] max-h-[85vh] w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 items-center overflow-y-auto rounded-lg bg-neutral-50 p-8 dark:bg-neutral-800',
          className
        )}
        role="dialog"
        aria-live="assertive"
      >
        {children}
      </div>
    </Portal>
  );
};
