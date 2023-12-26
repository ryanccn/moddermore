import type { NextPage } from "next";
import Link from "next/link";

import { useSession } from "next-auth/react";

import { CircleIcon, FolderIcon, HexagonIcon, SearchCheckIcon, TerminalIcon } from "lucide-react";
import { GlobalLayout } from "~/components/layout/GlobalLayout";

const NewIndex: NextPage = () => {
  useSession({ required: true });

  return (
    <GlobalLayout title="Create a new list">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/new/prism" className="new-card">
          <HexagonIcon className="block h-10 w-10" />
          <span>MultiMC/Prism Instance</span>
        </Link>
        <Link href="/new/mrpack" className="new-card">
          <CircleIcon className="block h-10 w-10" />
          <span>Modrinth pack</span>
        </Link>
        <Link href="/new/ferium" className="new-card">
          <TerminalIcon className="block h-10 w-10" />
          <span>Ferium</span>
        </Link>
        <Link href="/new/folder" className="new-card">
          <FolderIcon className="block h-10 w-10" />
          <span>Folder</span>
        </Link>
        <Link href="/new/manual" className="new-card md:col-span-2">
          <SearchCheckIcon className="block h-10 w-10" />
          <span>Manual</span>
        </Link>
      </div>
    </GlobalLayout>
  );
};

export default NewIndex;
