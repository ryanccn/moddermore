/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Metadata } from "./Metadata";

import type { ModList, ModListWithExtraData } from "~/types/moddermore";

interface BasicProps {
  list: ModList;
}

interface ExtraProps {
  listWithExtra: ModListWithExtraData;
}

export const ModListInList = (props: BasicProps | ExtraProps) => {
  const baseData = "listWithExtra" in props ? props.listWithExtra : props.list;

  return (
    <Link
      href={`/list/${baseData.id}`}
      key={baseData.id}
      className="group flex flex-col gap-y-3 rounded-lg bg-transparent p-6 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
    >
      <h2 className="font-display flex justify-between text-lg font-bold">{baseData.title}</h2>

      <Metadata data={baseData} />

      {"listWithExtra" in props && props.listWithExtra.ownerProfile && (
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

          <span className="text-sm font-semibold">{props.listWithExtra.ownerProfile.name}</span>
        </div>
      )}
    </Link>
  );
};
