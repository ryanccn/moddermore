import type { NextPage } from 'next';
import Link from 'next/link';

import { useSession } from 'next-auth/react';

import {
  CommandLineIcon,
  ArchiveBoxIcon,
  FolderIcon,
} from '@heroicons/react/20/solid';
import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { PrismIcon } from '~/components/icons';

const NewIndex: NextPage = () => {
  useSession({ required: true });

  return (
    <GlobalLayout title="Create a new list">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/new/ferium" className="new-card">
          <CommandLineIcon className="block h-10 w-10 stroke-[1.5]" />
          <span>Ferium</span>
        </Link>
        <Link href="/new/prism" className="new-card">
          <PrismIcon className="block h-10 w-10 stroke-[1.5]" />
          <span>MultiMC / Prism instance</span>
        </Link>
        <Link href="/new/folder" className="new-card">
          <FolderIcon className="block h-10 w-10 stroke-[1.5]" />
          <span>Folder</span>
        </Link>
        <Link href="/new/manual" className="new-card">
          <ArchiveBoxIcon className="block h-10 w-10 stroke-[1.5]" />
          <span>Manual</span>
        </Link>
      </div>
    </GlobalLayout>
  );
};

export default NewIndex;
