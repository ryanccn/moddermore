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
        <Link href="/new/prism" className="new-card bg-christmas-green">
          <HexagonIcon className="block h-10 w-10" />
          <span>MultiMC/Prism Instance</span>
        </Link>
        <Link href="/new/mrpack" className="new-card bg-christmas-red">
          <CircleIcon className="block h-10 w-10" />
          <span>Modrinth pack</span>
        </Link>
        <Link href="/new/ferium" className="new-card bg-christmas-red">
          <TerminalIcon className="block h-10 w-10" />
          <span>Ferium</span>
        </Link>
        <Link href="/new/folder" className="new-card bg-christmas-green">
          <FolderIcon className="block h-10 w-10" />
          <span>Folder</span>
        </Link>
        <Link href="/new/manual" className="new-card bg-christmas-light-green md:col-span-2">
          <SearchCheckIcon className="block h-10 w-10" />
          <span>Manual</span>
        </Link>
      </div>
    </GlobalLayout>
  );
};

export default NewIndex;
