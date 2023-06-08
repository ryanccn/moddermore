import { XMarkIcon } from '@heroicons/react/24/solid';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

interface Advisory {
  id: string;
  content: string | ReactNode;
  disabled?: boolean;
}

const ADVISORIES = [
  {
    id: '81F7D4B2-F303-4E94-826B-E03AD5DD99B2',
    content:
      'Multiple groups are reporting CurseForge as compromised. Malware has been uploaded in various projects and it may be a security vulnerability in the CurseForge platform. We recommend not downloading or updating any mods from CurseForge at the moment, and we will post more updates as more information becomes available.',
    disabled: true,
  },
  {
    id: '43D66819-9088-4BF4-971E-9E9DAE24F459',
    content: (
      <>
        <strong>Fractureiser</strong> is a virus found in several Minecraft
        projects uploaded to CurseForge and CraftBukkit&apos;s dev website. The
        malware is embedded in multiple mods, some of which were added to highly
        popular modpacks. The malware is only known to target Windows and Linux
        systems. For more information, read{' '}
        <a
          className="underline"
          href="https://github.com/fractureiser-investigation/fractureiser/blob/main/docs/users.md"
        >
          this very important document
        </a>
        .
      </>
    ),
  },
] satisfies Advisory[];

export const AdvisoryDrawer = () => {
  const [activeAdvisories, setActiveAdvisories] = useState<Advisory[]>([]);

  const updateAdvisories = useCallback(() => {
    const advisoryDataRaw = localStorage.getItem('advisories');
    const advisoryData = advisoryDataRaw
      ? JSON.parse(advisoryDataRaw)
      : ({} as { [id: string]: boolean });

    const activeAdvisories = ADVISORIES.filter(
      (a) => !a.disabled && !advisoryData[a.id]
    );
    setActiveAdvisories(activeAdvisories);
  }, []);

  useEffect(() => {
    updateAdvisories();
  }, [updateAdvisories]);

  const setRead = useCallback(
    (id: string) => {
      const advisoryDataRaw = localStorage.getItem('advisories');
      const advisoryData = advisoryDataRaw
        ? JSON.parse(advisoryDataRaw)
        : ({} as { [id: string]: boolean });

      advisoryData[id] = true;
      localStorage.setItem('advisories', JSON.stringify(advisoryData));

      updateAdvisories();
    },
    [updateAdvisories]
  );

  return (
    <div className="fixed bottom-0 right-0 p-4 flex flex-col gap-y-2 lg:max-w-md">
      {activeAdvisories.map((advisory) => (
        <div
          className="relative group bg-red-500 text-white font-semibold text-sm overflow-hidden rounded-lg p-4 text-left focus:ring-red-500/50"
          key={advisory.id}
        >
          <p>{advisory.content}</p>
          <button
            onClick={() => setRead(advisory.id)}
            className="absolute top-0 right-0 m-2"
          >
            <XMarkIcon className="block w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
