import type { RichMod } from '~/lib/extra.types';

import Image from 'next/future/image';
import { providerFormat } from '~/lib/strings';

export default function RichModDisplay({ data }: { data: RichMod }) {
  return (
    <a
      className="group flex space-x-4 rounded-sm bg-transparent p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
      href={data.href}
    >
      {data.iconUrl && (
        <Image
          width={64}
          height={64}
          src={data.iconUrl}
          alt={`Icon of ${data.name}`}
          className="h-[64px] w-[64px] rounded-md opacity-80 transition-opacity group-hover:opacity-100"
        />
      )}
      <div className="flex flex-col space-y-1">
        <h2 className="text-xl font-semibold">{data.name}</h2>
        {data.description && (
          <h3 className="text-sm text-zinc-800 dark:text-zinc-200">
            {data.description.length > 25
              ? data.description.substring(0, 24) + '...'
              : data.description}
          </h3>
        )}
        <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {providerFormat(data.provider)}
        </h3>
      </div>
    </a>
  );
}
