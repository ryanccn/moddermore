import type { ModrinthVersion } from '~/types/modrinth';
import type {
  Download,
  ExportReturnData,
  ProviderSpecificOptions,
} from './types';

const getObjFromVersion = (
  v: ModrinthVersion,
  type: 'direct' | 'dependency'
): Download => {
  const primary = v.files.filter((f) => f.primary)[0] ?? v.files[0];

  return {
    provider: 'modrinth',
    name: primary.filename,
    url: primary.url,
    type,
    hashes: primary.hashes,
    fileSize: primary.size,
  };
};

export const getModrinthDownload = async ({
  id,
  gameVersion,
  loader,
  name,
}: ProviderSpecificOptions): Promise<ExportReturnData> => {
  const res = await fetch(
    `https://api.modrinth.com/v2/project/${id}/version?loaders=["${loader}"]&game_versions=["${gameVersion}"]`,
    {
      headers: { 'User-Agent': 'Moddermore/noversion' },
    }
  );

  if (res.status === 404) {
    return [{ error: 'notfound', name }];
  }

  const data = (await res.json()) as ModrinthVersion[];

  let latest = data.filter((v) => v.version_type === 'release')[0];
  if (!latest) {
    latest = data.filter((v) => v.version_type === 'beta')[0];
  }
  if (!latest) {
    latest = data.filter((v) => v.version_type === 'alpha')[0];
  }

  if (!latest && loader === 'quilt') {
    const res = await fetch(
      `https://api.modrinth.com/v2/project/${id}/version?loaders=["fabric"]&game_versions=["${gameVersion}"]`,
      {
        headers: { 'User-Agent': 'Moddermore/noversion' },
      }
    );

    const data = (await res.json()) as ModrinthVersion[];

    latest = data.filter((v) => v.version_type === 'release')[0];
    if (!latest) {
      latest = data.filter((v) => v.version_type === 'beta')[0];
    }
    if (!latest) {
      latest = data.filter((v) => v.version_type === 'alpha')[0];
    }
  }

  if (!latest) {
    return [{ error: 'notfound', name }];
  }

  const ret = [];
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
            gameVersion,
            loader,
            name,
          }))
        );
      }
    }
  }

  return ret;
};
