/* eslint-disable @next/next/no-img-element */

import type { RichMod } from '~/types/moddermore';

import { providerFormat, numberFormat } from '~/lib/strings';
import {
  PlusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface Props {
  data: RichMod;
  buttonType?: 'add' | 'delete' | null;
  onClick?: () => void;
  className?: string;
}

export const RichModDisplay = ({
  data,
  buttonType,
  onClick,
  className,
}: Props) => {
  return (
    <div
      className={clsx(
        'flex justify-between rounded-2xl border-none bg-neutral-100 p-4 pt-4 shadow-sm dark:bg-neutral-800',
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
            <div className="mb-2 flex flex-wrap">
              <a
                className="flex items-center underline"
                href={data.href}
                rel="noreferrer noopener"
              >
                {providerFormat(data.provider)}
                <ArrowTopRightOnSquareIcon className="mr-auto ml-1 h-4 w-4" />
              </a>
            </div>
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
