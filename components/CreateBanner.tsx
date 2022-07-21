import clsx from 'clsx';
import Link from 'next/link';

import { useState } from 'react';
import useTimeout from '~/hooks/useTimeout';

export default function CreateBanner() {
  const [hide, setHide] = useState(false);

  useTimeout(() => {
    setHide(true);
  }, 10000);

  return (
    <div
      className={clsx([
        'fixed bottom-0 mx-auto mb-4 flex w-full max-w-[75ch] items-center justify-between bg-zinc-50/80 p-4 px-6 backdrop-blur-md dark:bg-zinc-800/80',
        'transform-gpu transition-transform',
        hide ? 'translate-y-[calc(100%_+_1rem)]' : 'translate-y-0',
      ])}
    >
      <span>Want your own list just like this?</span>
      <Link href="/new">
        <a className="primaryish-button">Create your own</a>
      </Link>
    </div>
  );
}
