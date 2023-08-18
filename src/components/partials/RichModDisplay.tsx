/* eslint-disable @next/next/no-img-element */

import type { ModList, RichMod } from '~/types/moddermore';

import { providerFormat, numberFormat } from '~/lib/strings';
import { twMerge } from 'tailwind-merge';
import { useMemo } from 'react';
import { Button } from '../ui/Button';
import {
  ArrowUpRightIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';

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
  const incompatible = useMemo(
    () =>
      parent &&
      data.gameVersions &&
      !data.gameVersions.includes(parent.gameVersion),
    [parent, data.gameVersions],
  );

  return (
    <div
      className={twMerge(
        'flex justify-between rounded-2xl border-none bg-neutral-100 p-5 dark:bg-neutral-800',
        incompatible ? 'ring-2 ring-red-400/70 hover:ring-red-400/80' : null,
        className,
      )}
    >
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

      <div className="flex grow flex-col gap-y-2 gap-x-2 sm:flex-row sm:justify-between">
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
            className="group flex flex-wrap items-center gap-x-1 self-start underline decoration-black/50 underline-offset-2 transition-[text-decoration-color] hover:decoration-black/75 dark:decoration-white/50 dark:hover:decoration-white/75"
            href={data.href}
            rel="noreferrer noopener"
          >
            {providerFormat(data.provider)}
            <ArrowUpRightIcon className="block w-5 h-5" />
          </a>
        </div>

        <div className="min-w-fit">
          {data.downloads && (
            <div className="mb-2 flex items-center sm:justify-end">
              <DownloadIcon className="mr-1 w-5 h-5" />
              <p className="font-medium">
                <strong>{numberFormat(data.downloads)}</strong> downloads
              </p>
            </div>
          )}

          <div className="flex flex-col sm:items-end">
            {onClick && (
              <>
                {buttonType === 'delete' && (
                  <Button type="button" variant="danger" onClick={onClick}>
                    <TrashIcon className="block w-5 h-5" />
                    <span>Delete</span>
                  </Button>
                )}

                {buttonType === 'add' && (
                  <Button type="button" variant="green" onClick={onClick}>
                    <PlusIcon className="block w-5 h-5" />
                    <span>Add</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
