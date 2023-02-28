import Link from 'next/link';
import { LegacyBadge } from './LegacyBadge';

import { loaderFormat } from '~/lib/strings';
import type { ModList } from '~/types/moddermore';

export const ModListInList = ({ list }: { list: ModList }) => {
  return (
    <Link
      href={`/list/${list.customSlug ?? list.id}`}
      key={list.id}
      className="group flex flex-col gap-y-3 rounded-lg bg-transparent p-6 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
    >
      <h2 className="flex justify-between text-lg font-semibold">
        <span>{list.title}</span>
        {list.legacy && <LegacyBadge />}
      </h2>
      <div className="data-list text-sm">
        <p>
          For Minecraft <strong>{list.gameVersion}</strong> with{' '}
          <strong>{loaderFormat(list.modloader)}</strong>
        </p>
        <p>
          Last updated{' '}
          <strong>{new Date(list.created_at).toDateString()}</strong>
        </p>
      </div>
    </Link>
  );
};
