import type { NextPage } from 'next';
import Link from 'next/link';

import { useSession } from 'next-auth/react';

import {
  CommandLineIcon,
  ArchiveBoxIcon,
  FolderIcon,
} from '@heroicons/react/20/solid';
import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { PolyMCIcon } from '~/components/icons';

const NewIndex: NextPage = () => {
  useSession({ required: true });

  return (
    <GlobalLayout title="Create a new list">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/new/ferium">
          <a className="new-card">
            <CommandLineIcon className="block h-10 w-10 stroke-[1.5]" />
            <span>Ferium</span>
          </a>
        </Link>
        <Link href="/new/polymc">
          <a className="new-card">
            <PolyMCIcon className="block h-10 w-10 stroke-[1.5]" />
            <span>MultiMC / PolyMC instance</span>
          </a>
        </Link>
        <Link href="/new/folder">
          <a className="new-card">
            <FolderIcon className="block h-10 w-10 stroke-[1.5]" />
            <span>Folder</span>
          </a>
        </Link>
        <Link href="/new/manual">
          <a className="new-card">
            <ArchiveBoxIcon className="block h-10 w-10 stroke-[1.5]" />
            <span>Manual</span>
          </a>
        </Link>
      </div>
    </GlobalLayout>
  );
};

export default NewIndex;
