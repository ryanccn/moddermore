import type { ModrinthVersion } from '~/types/modrinth';
import type {
  Download,
  ExportReturnData,
  ProviderSpecificOptions,
} from './types';

import minecraftVersions from '~/lib/minecraftVersions.json';

const getObjFromVersion = (
  v: ModrinthVersion,
  type: 'direct' | 'dependency'
): Download => {
  const primary = v.files.filter((f) => f.primary)[0] ?? v.files[0];

  return {
    provider: 'modrinth',
    name: primary.filename,
    id: v.project_id,
    url: primary.url,
    type,
    hashes: primary.hashes,
    fileSize: primary.size,
    displayName: v.name,
    version: v.id,
  };
};

export const callModrinthAPI = async ({
  id,
  gameVersions,
  loader,
  version,
}: ProviderSpecificOptions): Promise<ModrinthVersion | null> => {
  if (version) {
    const res = await fetch(
      `https://api.modrinth.com/v2/version/${encodeURIComponent(version)}`,
      {
        headers: { 'User-Agent': 'Moddermore/noversion' },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as ModrinthVersion;

    return data;
  }

  const res = await fetch(
    `https://api.modrinth.com/v2/project/${encodeURIComponent(
      id
    )}/version?loaders=["${encodeURIComponent(
      loader
    )}"]&game_versions=[${encodeURIComponent(
      gameVersions.map((a) => `"${a}"`).join(',')
    )}]`,
    {
      headers: { 'User-Agent': 'Moddermore/noversion' },
    }
  );

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as ModrinthVersion[];

  let latest = data.filter((v) => v.version_type === 'release')[0];
  if (!latest) {
    latest = data.filter((v) => v.version_type === 'beta')[0];
  }
  if (!latest) {
    latest = data.filter((v) => v.version_type === 'alpha')[0];
  }

  return latest ?? null;
};

export const getModrinthDownload = async ({
  id,
  gameVersions,
  loader,
  name,
  version,
}: ProviderSpecificOptions): Promise<ExportReturnData> => {
  let latest: ModrinthVersion | null = null;

  latest = await callModrinthAPI({ id, gameVersions, loader, name, version });

  if (!latest && loader === 'quilt') {
    latest = await callModrinthAPI({
      id,
      gameVersions,
      loader: 'fabric',
      name,
      version,
    });
  }

  if (!latest) {
    const compatGameVersions = minecraftVersions.filter((a) =>
      a.startsWith(gameVersions[0].split('.').slice(0, 2).join('.'))
    );

    latest = await callModrinthAPI({
      id,
      gameVersions: compatGameVersions,
      loader,
      name,
      version,
    });
  }

  if (!latest && loader === 'quilt') {
    const compatGameVersions = minecraftVersions.filter((a) =>
      a.startsWith(gameVersions[0].split('.').slice(0, 2).join('.'))
    );

    latest = await callModrinthAPI({
      id,
      gameVersions: compatGameVersions,
      loader: 'fabric',
      name,
      version,
    });
  }

  if (!latest) {
    return [{ error: 'notfound', name, id }];
  }

  let ret: ExportReturnData = [];
  ret.push(getObjFromVersion(latest, 'direct'));

  /*
  if (latest.dependencies) {
    for (const dep of latest.dependencies.filter(
      (d) => d.dependency_type === 'required'
    )) {
      if (dep.version_id) {
        const v = (await fetch(
          `https://api.modrinth.com/v2/version/${dep.version_id}`
        ).then((r) => r.json())) as ModrinthVersion;

        ret.push(getObjFromVersion(v, 'dependency'));
      } else {
        ret.push(
          ...(await getModrinthDownload({
            id: dep.project_id,
            gameVersions,
            loader,
            name,
          }))
        );
      }
    }
  }
  */

  // Fabric API to QSL swap
  if (loader === 'quilt' && ret.filter((t) => t.id === 'P7dR8mSH').length > 0) {
    ret = ret.filter((t) => t.id !== 'P7dR8mSH');
    ret.push(
      ...(await getModrinthDownload({
        id: 'qvIfYCYJ',
        gameVersions,
        loader,
        name,
      }))
    );
  }

  return ret;
};
