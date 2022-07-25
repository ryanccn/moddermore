import type { NextPage } from 'next';
import Link from 'next/link';

import {
  TerminalIcon,
  ArchiveIcon,
  FolderIcon,
} from '@heroicons/react/outline';
import GlobalLayout from '~/components/GlobalLayout';

const NewIndex: NextPage = () => {
  return (
    <GlobalLayout title="Create a new list">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/new/ferium">
          <a className="new-card">
            <TerminalIcon className="block h-10 w-10 stroke-[1.5]" />
            <span>Ferium</span>
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
            <ArchiveIcon className="block h-10 w-10 stroke-[1.5]" />
            <span>Manual</span>
          </a>
        </Link>
      </div>
    </GlobalLayout>
  );
};

export default NewIndex;
