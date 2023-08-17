import type { NextPage } from 'next';
import Link from 'next/link';

import { useSession } from 'next-auth/react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import {
  FolderArchiveIcon,
  FolderIcon,
  HexagonIcon,
  TerminalIcon,
} from 'lucide-react';

const NewIndex: NextPage = () => {
  useSession({ required: true });

  return (
    <GlobalLayout title="Create a new list">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/new/prism" className="new-card">
          <HexagonIcon className="block h-10 w-10 stroke-[1.5]" />
          <span>MultiMC / Prism Instance</span>
        </Link>
        <Link href="/new/ferium" className="new-card">
          <TerminalIcon className="block h-10 w-10 stroke-[1.5]" />
          <span>Ferium</span>
        </Link>
        <Link href="/new/folder" className="new-card">
          <FolderIcon className="block h-10 w-10 stroke-[1.5]" />
          <span>Folder</span>
        </Link>
        <Link href="/new/manual" className="new-card">
          <FolderArchiveIcon className="block h-10 w-10 stroke-[1.5]" />
          <span>Manual</span>
        </Link>
      </div>
    </GlobalLayout>
  );
};

export default NewIndex;
