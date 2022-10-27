/* eslint-disable @next/next/no-img-element */

import type { RichMod } from '~/types/moddermore';

import { providerFormat, numberFormat } from '~/lib/strings';
import {
  PlusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid';

interface Props {
  data: RichMod;
  buttonType?: 'add' | 'delete';
  onClick?: () => void;
}

export const RichModDisplay = ({ data, buttonType, onClick }: Props) => {
  return (
    <div className="flex justify-between rounded-2xl border-none bg-zinc-100 p-4 pt-4 shadow-sm dark:bg-zinc-800">
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
        <div className="flex grow flex-col sm:flex-row sm:justify-between">
          <div className="flex flex-col">
            <div className="flex shrink-0 flex-wrap align-baseline">
              <h2 className="mr-2 text-xl font-bold">{data.name}</h2>
            </div>
            <p className="my-0.5 font-medium">{data.description}</p>
            <div className="mb-2 flex flex-wrap">
              <a
                className="flex items-center underline"
                href={data.href}
                target="_blank"
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
                      className="primaryish-button mb-2 bg-red-500"
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
