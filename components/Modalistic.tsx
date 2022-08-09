import { Root as Portal } from '@radix-ui/react-portal';
import { m } from 'framer-motion';
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
      <m.div className="modal-backdrop" onClick={backdropClickHandler} />

      <m.div
        className={clsx('modal-modal', className)}
        role="dialog"
        aria-live="assertive"
        initial={{ scale: 0.1, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: [0.1, 1.1, 1],
          translateX: '-50%',
          translateY: '-50%',
        }}
        exit={{
          scale: [1, 1.1, 0.1],
          translateX: '-50%',
          translateY: '-50%',
        }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </m.div>
    </Portal>
  );
};
