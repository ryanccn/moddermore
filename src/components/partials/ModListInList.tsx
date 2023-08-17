/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';

import { loaderFormat } from '~/lib/strings';
import type { ModList, ModListWithExtraData } from '~/types/moddermore';

interface BasicProps {
  list: ModList;
}

interface ExtraProps {
  listWithExtra: ModListWithExtraData;
}

export const ModListInList = (props: BasicProps | ExtraProps) => {
  const baseData = 'listWithExtra' in props ? props.listWithExtra : props.list;

  return (
    <Link
      href={`/list/${baseData.id}`}
      key={baseData.id}
      className="group flex flex-col gap-y-3 rounded-lg bg-transparent p-6 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
    >
      <h2 className="flex justify-between text-lg font-semibold">
        <span>{baseData.title}</span>
      </h2>
      <div className="data-list text-sm">
        <p>
          For Minecraft <strong>{baseData.gameVersion}</strong> with{' '}
          <strong>{loaderFormat(baseData.modloader)}</strong>
        </p>
        <p>
          Last updated{' '}
          <strong>{new Date(baseData.created_at).toDateString()}</strong>
        </p>
      </div>

      {'listWithExtra' in props && props.listWithExtra.ownerProfile && (
        <div className="mt-4 flex flex-row items-center gap-x-3">
          {props.listWithExtra.ownerProfile.profilePicture ? (
            <img
              src={props.listWithExtra.ownerProfile.profilePicture}
              width={24}
              height={24}
              className="rounded-full"
              alt=""
            />
          ) : (
            <div className="h-[24px] w-[24px] rounded-full bg-neutral-100 dark:bg-neutral-700" />
          )}

          <span className="text-sm font-semibold">
            {props.listWithExtra.ownerProfile.name}
          </span>
        </div>
      )}
    </Link>
  );
};
