import { type AnyJson, stringify } from '@iarna/toml';

import { getSpecificList } from '~/lib/db';
import { sha512 } from '~/lib/sha512';
import {
  getLatestFabric,
  getLatestForge,
  getLatestQuilt,
} from './loaderVersions';

import { callModrinthAPI } from './modrinth';
import { callCurseForgeAPI } from './curseforge';
import pLimit from 'p-limit';

import type { ProviderSpecificOptions } from './types';

export const getPackTOML = async (id: string) => {
  const list = await getSpecificList(id);

  if (!list) return null;

  const indexHash = await sha512((await getIndexTOML(id)) || '');

  return stringify({
    name: list.title,
    'pack-format': 'packwiz:1.1.0',
    versions: {
      minecraft: list.gameVersion,
      ...(list.modloader === 'fabric'
        ? { fabric: await getLatestFabric() }
        : {}),
      ...(list.modloader === 'quilt' ? { quilt: await getLatestQuilt() } : {}),
      ...(list.modloader === 'forge' ? { forge: await getLatestForge() } : {}),
    },
    index: { file: 'index.toml', 'hash-format': 'sha512', hash: indexHash },
  });
};

export const getIndexTOML = async (id: string) => {
  const list = await getSpecificList(id);

  if (!list) return null;

  const lim = pLimit(10);

  return stringify({
    'hash-format': 'sha512',
    files: await Promise.all(
      list.mods.map((mod) =>
        lim(async () => {
          if (mod.provider === 'modrinth') {
            const txt = await getModrinthTOML({
              id: mod.id,
              gameVersions: [list.gameVersion],
              loader: list.modloader,
              name: '',
            });

            if (!txt) return null;

            return {
              file: `mods/${mod.provider}-${mod.id}.pw.toml`,
              hash: await sha512(stringify(txt)),
              metafile: true,
            };
          } else if (mod.provider === 'curseforge') {
            const txt = await getCurseForgeTOML({
              id: mod.id,
              gameVersions: [list.gameVersion],
              loader: list.modloader,
              name: '',
            });

            if (!txt) return null;

            return {
              file: `mods/${mod.provider}-${mod.id}.pw.toml`,
              hash: await sha512(stringify(txt)),
              metafile: true,
            };
          }

          return null;
        })
      )
    ).then((res) => res.filter(Boolean) as AnyJson),
  });
};

export const getModrinthTOML = async (data: ProviderSpecificOptions) => {
  const res = await callModrinthAPI(data);
  if (!res) return null;

  const f = res.files[0];

  return {
    name: res.name,
    filename: f.filename,
    download: { url: f.url, 'hash-format': 'sha512', hash: f.hashes.sha512 },
    update: {
      modrinth: {
        'mod-id': res.project_id,
        version: res.id,
      },
    },
  };
};

export const getCurseForgeTOML = async (data: ProviderSpecificOptions) => {
  const res = await callCurseForgeAPI(data);
  if (!res || res.length === 0) return null;

  const f = res[0];

  return {
    name: f.displayName ?? f.fileName,
    filename: f.fileName,
    download: {
      mode: 'metadata:curseforge',
      'hash-format': 'sha1',
      hash: f.hashes.filter((k) => k.algo === 1)[0].value,
    },
    update: { curseforge: { 'file-id': f.id, 'project-id': f.modId } },
  };
};
