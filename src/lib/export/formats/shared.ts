import type JSZip from 'jszip';
import type { SetStateFn } from '~/types/react';
import type { ExportReturnData } from '../upstream/types';

import pLimit from 'p-limit';

export const enum ExportStatus {
  Idle,
  Resolving,
  Downloading,
  Result,
  GeneratingZip,
  ModrinthForm,
}

export interface PageStateHooks {
  setProgress: SetStateFn<{ value: number; max: number }>;
  setStatus: SetStateFn<ExportStatus>;
  setResult: SetStateFn<{ success: string[]; failed: string[] }>;
}

export const exportZip = async ({
  zipfile,
  urls,
  setResult,
  setProgress,
}: { zipfile: JSZip; urls: ExportReturnData } & PageStateHooks) => {
  const modFolder = zipfile.folder('mods');

  if (!modFolder) {
    throw new Error('f');
  }

  const lim = pLimit(8);

  await Promise.all(
    urls.map((downloadData) =>
      lim(async () => {
        if ('error' in downloadData) {
          setResult((a) => ({
            ...a,
            failed: [...a.failed, `${downloadData.name} ${downloadData.error}`],
          }));
          return;
        }

        const fileContents = await fetch(
          downloadData.provider === 'curseforge'
            ? `/api/cursed?url=${encodeURIComponent(downloadData.url)}`
            : downloadData.url,
        ).then((r) => {
          if (!r.ok) {
            return null;
          }

          return r.blob();
        });

        if (!fileContents) {
          setResult((a) => ({
            ...a,
            failed: [
              ...a.failed,
              `${downloadData.name} network request failed`,
            ],
          }));
          return;
        }

        modFolder.file(downloadData.name, fileContents);

        if (downloadData.type === 'direct') {
          setProgress((old) => ({
            value: old.value + 1,
            max: old.max,
          }));
        }

        setResult((a) => ({
          ...a,
          success: [...a.success, downloadData.name],
        }));
      }),
    ),
  );
};
