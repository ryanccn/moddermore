import type { ModrinthVersion } from '~/types/modrinth';
import type {
  Download,
  ExportReturnData,
  ProviderSpecificOptions,
} from './types';

import minecraftVersions from '../minecraftVersions.json';

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
  };
};

/** WTF even is this function? what's it for? */
const callModrinthAPI = async ({
  id,
  gameVersions,
  loader,
}: ProviderSpecificOptions): Promise<ModrinthVersion | null> => {
  const res = await fetch(
    `https://api.modrinth.com/v2/project/${id}/version?loaders=["${loader}"]&game_versions=[${gameVersions
      .map((a) => `"${a}"`)
      .join(',')}]`,
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
}: ProviderSpecificOptions): Promise<ExportReturnData> => {
  let latest: ModrinthVersion | null = null;

  latest = await callModrinthAPI({ id, gameVersions, loader, name });

  if (!latest && loader === 'quilt') {
    latest = await callModrinthAPI({
      id,
      gameVersions,
      loader: 'fabric',
      name,
    });
  }

  if (!latest) {
    const compatGameVersions = minecraftVersions.filter((a) =>
      a.startsWith(gameVersions[0].split('.').slice(0, 3).join('.'))
    );

    console.log('aaaa', compatGameVersions);

    latest = await callModrinthAPI({
      id,
      gameVersions: compatGameVersions,
      loader,
      name,
    });
  }

  if (!latest && loader === 'quilt') {
    const compatGameVersions = minecraftVersions.filter((a) =>
      a.startsWith(gameVersions[0].split('.').slice(0, 2).join('.'))
    );

    console.log('aaaa', compatGameVersions);

    latest = await callModrinthAPI({
      id,
      gameVersions: compatGameVersions,
      loader: 'fabric',
      name,
    });
  }

  if (!latest) {
    return [{ error: 'notfound', name, id }];
  }

  let ret: ExportReturnData = [];
  ret.push(getObjFromVersion(latest, 'direct'));

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

  ret = ret.filter(
    (value, index, self) => index === self.findIndex((t) => t.id === value.id)
  );

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
