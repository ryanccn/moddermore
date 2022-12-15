import JSZip from 'jszip';
import {
  getLatestFabric,
  getLatestForge,
  getLatestQuilt,
} from './loaderVersions';

import type { RichModList } from '~/types/moddermore';
import type { ExportReturnData, ModrinthDownload } from './types';

export const generateModrinthPack = async (
  list: RichModList,
  urls: ExportReturnData
) => {
  console.log({ list, urls });

  const mrIndex = {
    formatVersion: 1,
    game: 'minecraft',
    versionId: '0.0.1',
    name: list.title,
    summary: 'Generated from Moddermore (https://moddermore.net/)',
    files: (
      urls.filter(
        (dl) => !('error' in dl) && dl.provider === 'modrinth'
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
        ? { forge: await getLatestForge() }
        : list.modloader === 'fabric'
        ? { 'fabric-loader': await getLatestFabric() }
        : list.modloader === 'quilt'
        ? { 'quilt-loader': await getLatestQuilt() }
        : {}),
    },
  };

  console.log({ mrIndex });

  const indexJSON = JSON.stringify(mrIndex);
  const mrpack = new JSZip();
  mrpack.file('modrinth.index.json', indexJSON);

  return mrpack.generateAsync({ type: 'blob' });
};
