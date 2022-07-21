import type { RichMod } from '~/lib/extra.types';

import Image from 'next/future/image';
import { providerFormat } from '~/lib/strings';

// import PlusIcon from '@heroicons/react/solid/PlusIcon';

function SomeDetails({ data }: { data: RichMod }) {
  return (
    <>
      {data.iconUrl && (
        <Image
          width={64}
          height={64}
          src={data.iconUrl}
          alt={`Icon of ${data.name}`}
          className="h-[64px] w-[64px] rounded-md opacity-80 transition-opacity group-hover:opacity-100"
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
}

interface Props {
  data: RichMod;
  onClick?: () => void;
}

export default function RichModDisplay({ data, onClick }: Props) {
  if (onClick) {
    return (
      <button
        type="button"
        className="group flex space-x-4 rounded-sm bg-transparent p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
        onClick={onClick}
      >
        <SomeDetails data={data} />
      </button>
    );
  }

  return (
    <a
      className="group flex space-x-4 rounded-sm bg-transparent p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
      href={data.href}
    >
      <SomeDetails data={data} />
    </a>
  );
}
