import { Root as Portal } from '@radix-ui/react-portal';
import { m } from 'framer-motion';

import { type ReactNode } from 'react';

export default function Modalistic({
  backdropClickHandler,
  children,
}: {
  backdropClickHandler?: () => any;
  children: ReactNode | ReactNode[];
}) {
  return (
    <Portal container={document.body}>
      <m.div
        className="fixed inset-0 bg-white/75 backdrop-blur-md dark:bg-zinc-900/75"
        onClick={backdropClickHandler}
      />

      <m.div
        className="fixed top-1/2 left-1/2 z-[88] flex max-h-[85vh] w-[90%] max-w-lg flex-col items-center space-y-4 overflow-y-auto rounded-lg bg-zinc-50 p-8 dark:bg-zinc-800"
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
}
