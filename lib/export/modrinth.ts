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
    id: v.project_id,
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
    return [{ error: 'notfound', name, id }];
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
            gameVersion,
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

  if (loader === 'quilt' && ret.filter((t) => t.id === 'P7dR8mSH').length > 0) {
    ret = ret.filter((t) => t.id !== 'P7dR8mSH');
    ret.push(
      ...(await getModrinthDownload({
        id: 'qvIfYCYJ',
        gameVersion,
        loader,
        name,
      }))
    );
  }

  return ret;
};
