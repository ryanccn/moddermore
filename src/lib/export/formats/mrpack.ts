import JSZip from 'jszip';
import {
  getLatestFabric,
  getLatestForge,
  getLatestQuilt,
} from '../upstream/loaderVersions';

import { saveAs } from 'file-saver';
import { ExportStatus, type PageStateHooks } from './shared';
import { getDownloadURLs } from '../upstream/download';

import type { RichModList } from '~/types/moddermore';
import type {
  CurseForgeDownload,
  ExportReturnData,
  ModrinthDownload,
} from '../upstream/types';

const sha1 = async (f: ArrayBuffer) => {
  const ha = await window.crypto.subtle.digest('SHA-1', f);
  const he = [...new Uint8Array(ha)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  return he;
};

const sha512 = async (f: ArrayBuffer) => {
  const ha = await window.crypto.subtle.digest('SHA-512', f);
  const he = [...new Uint8Array(ha)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  return he;
};

const generateModrinthPack = async (
  list: RichModList,
  urls: ExportReturnData,
  extraData: { name?: string; version?: string; cfStrategy?: string },
) => {
  const mrIndex = {
    formatVersion: 1,
    game: 'minecraft',
    versionId: extraData.version ?? '0.0.1',
    name: extraData.name ?? list.title,
    summary: 'Generated from Moddermore (https://moddermore.net/)',
    files: (
      urls.filter(
        (dl) => !('error' in dl) && dl.provider === 'modrinth',
      ) as ModrinthDownload[]
    ).map((dl) => {
      return {
        path: `mods/${dl.name}`,
        downloads: [dl.url],
        hashes: dl.hashes,
        fileSize: dl.fileSize,
      };
    }),
    dependencies: {
      minecraft: list.gameVersion,
      ...(list.modloader === 'forge'
        ? { forge: await getLatestForge(list.gameVersion) }
        : list.modloader === 'fabric'
        ? { 'fabric-loader': await getLatestFabric() }
        : list.modloader === 'quilt'
        ? { 'quilt-loader': await getLatestQuilt() }
        : {}),
    },
  };

  const mrpack = new JSZip();

  if (extraData.cfStrategy === 'embed') {
    const cfDownloads = urls.filter(
      (dl) => !('error' in dl) && dl.provider === 'curseforge',
    ) as CurseForgeDownload[];

    for (const url of cfDownloads) {
      const fileContents = await fetch(
        `/api/cursed?url=${encodeURIComponent(url.url)}`,
      ).then((r) => {
        if (!r.ok) {
          return null;
        }

        return r.blob();
      });

      if (!fileContents) continue;

      mrpack.file(`overrides/mods/${url.name}`, fileContents);
    }
  } else if (extraData.cfStrategy === 'links') {
    const cfDownloads = urls.filter(
      (dl) => !('error' in dl) && dl.provider === 'curseforge',
    ) as CurseForgeDownload[];

    for (const url of cfDownloads) {
      const fileContents = await fetch(
        `/api/cursed?url=${encodeURIComponent(url.url)}`,
      ).then((r) => {
        if (!r.ok) {
          return null;
        }

        return r.blob();
      });

      if (!fileContents) continue;

      const one = await sha1(await fileContents.arrayBuffer());
      const fiveonetwo = await sha512(await fileContents.arrayBuffer());

      mrIndex.files.push({
        downloads: [url.url],
        fileSize: url.fileSize,
        hashes: { sha1: one, sha512: fiveonetwo },
        path: `mods/${url.name}`,
      });
    }
  }

  const indexJSON = JSON.stringify(mrIndex);
  mrpack.file('modrinth.index.json', indexJSON);

  return mrpack.generateAsync({ type: 'blob' });
};

export const modrinthExport = async ({
  data,
  mrpackData,
  setProgress,
  setStatus,
}: {
  data: RichModList;
  mrpackData: { name: string; version: string; cfStrategy: string };
} & PageStateHooks) => {
  setStatus(ExportStatus.Resolving);
  setProgress({ value: 0, max: data.mods.length });

  const urls = await getDownloadURLs(data, setProgress);

  const mrpack = await generateModrinthPack(data, urls, mrpackData);
  saveAs(mrpack, `${data.title}.mrpack`);

  setStatus(ExportStatus.Idle);
};
