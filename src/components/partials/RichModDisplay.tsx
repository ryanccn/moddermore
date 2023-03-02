/* eslint-disable @next/next/no-img-element */

import type { ModList, RichMod } from '~/types/moddermore';

import { providerFormat, numberFormat } from '~/lib/strings';
import {
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface Props {
  data: RichMod;
  buttonType?: 'add' | 'delete' | null;
  onClick?: () => void;
  className?: string;
  parent?: ModList;
}

export const RichModDisplay = ({
  data,
  buttonType,
  onClick,
  className,
  parent,
}: Props) => {
  const incompatible =
    parent &&
    data.gameVersions &&
    !data.gameVersions.includes(parent.gameVersion);
  return (
    <div
      className={clsx(
        'flex justify-between rounded-2xl border-none bg-neutral-100 p-5 shadow-sm dark:bg-neutral-800',
        incompatible ? 'ring-2 ring-red-400/70' : null,
        className
      )}
    >
      <div className="flex w-full">
        <div className="shrink-0">
          {data.iconUrl && (
            <img
              src={data.iconUrl}
              alt={`Icon of ${data.name}`}
              className="mr-4 h-16 w-16 rounded-2xl object-contain"
              width={64}
              height={64}
            />
          )}
        </div>

        <div className="flex grow flex-col gap-x-2 sm:flex-row sm:justify-between">
          <div className="flex flex-col justify-between gap-y-2">
            <div className="flex flex-col gap-y-1">
              <h2 className="mr-2 text-xl font-bold">{data.name}</h2>
              <p className="my-0.5">{data.description}</p>
            </div>

            {incompatible && (
              <div className="font-medium text-red-500 dark:text-red-400">
                Incompatible with current list!
              </div>
            )}

            <a
              className="group flex flex-wrap items-center gap-x-1 self-start underline decoration-black/50 underline-offset-2 transition-all hover:decoration-black/75 dark:decoration-white/50 dark:hover:decoration-white/75"
              href={data.href}
              rel="noreferrer noopener"
            >
              {providerFormat(data.provider)}
              <ArrowUpRightIcon className="block h-4 w-4" />
            </a>
          </div>

          <div className="min-w-fit">
            {data.downloads && (
              <div className="mb-2 flex items-center sm:justify-end">
                <ArrowDownTrayIcon className="mr-1 h-4 w-4" />
                <p className="font-medium">
                  <strong>{numberFormat(data.downloads)}</strong> downloads
                </p>
              </div>
            )}
            <div className="flex flex-col sm:items-end">
              {onClick && (
                <>
                  {buttonType === 'delete' && (
                    <button
                      className="primaryish-button oh-no mb-2"
                      onClick={onClick}
                    >
                      <TrashIcon className="block h-5 w-5" />
                      <span>Delete</span>
                    </button>
                  )}
                  {buttonType === 'add' && (
                    <button
                      className="primaryish-button mb-2 bg-green-500"
                      onClick={onClick}
                    >
                      <PlusIcon className="block h-5 w-5" />
                      <span>Add</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
