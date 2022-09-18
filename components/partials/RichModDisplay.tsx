/* eslint-disable @next/next/no-img-element */

import type { RichMod } from '~/types/moddermore';

import { providerFormat } from '~/lib/strings';
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid';

const SomeDetails = ({ data }: { data: RichMod }) => {
  return (
    <>
      {data.iconUrl && (
        <img
          src={data.iconUrl}
          alt={`Icon of ${data.name}`}
          className="h-[64px] w-[64px] rounded-md opacity-80 transition-opacity group-hover:opacity-100"
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="flex w-full flex-col space-y-1">
        <h2 className="text-xl font-semibold">{data.name}</h2>
        {data.description && (
          <h3 className="w-full text-sm text-zinc-800 dark:text-zinc-200">
            {data.description}
          </h3>
        )}
        <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {providerFormat(data.provider)}
        </h3>
      </div>
    </>
  );
};

interface Props {
  data: RichMod;
  buttonType?: 'add' | 'delete';
  onClick?: () => void;
}

export const RichModDisplay = ({ data, buttonType, onClick }: Props) => {
  if (onClick) {
    if (buttonType === 'delete') {
      return (
        <div className="group flex space-x-4 rounded-sm bg-transparent p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <SomeDetails data={data} />
          <button
            className="flex-grow-0 self-center rounded-md p-2"
            type="button"
          >
            <TrashIcon
              className="block h-5 w-5 text-red-500"
              onClick={onClick}
            />
          </button>
        </div>
      );
    } else if (buttonType === 'add') {
      return (
        <div className="group flex space-x-4 rounded-sm bg-transparent p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <SomeDetails data={data} />
          <button
            className="flex-grow-0 self-center rounded-md p-2"
            type="button"
          >
            <PlusIcon
              className="block h-5 w-5 text-green-500"
              onClick={onClick}
            />
          </button>
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <a
      className="group flex space-x-4 rounded-sm bg-transparent p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
      href={data.href}
      target="_blank"
      rel="noreferrer noopener"
    >
      <SomeDetails data={data} />
    </a>
  );
};
