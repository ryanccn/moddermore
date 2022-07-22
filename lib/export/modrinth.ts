import type {
  Download,
  ExportReturnData,
  ProviderSpecificOptions,
} from './types';

interface Version {
  name: string;
  version_number: string;
  changelog: string | null;
  dependencies:
    | {
        version_id: string;
        project_id: string;
        dependency_type: string;
      }[]
    | null;

  game_versions: string[];
  version_type: string;
  loaders: string[];
  featured: boolean;

  id: string;
  project_id: string;
  author_id: string;
  date_published: string;
  downloads: number;

  files: {
    hashes: {
      sha512: string;
      sha1: string;
    };
    url: string;
    filename: string;
    primary: boolean;
    size: number;
  }[];
}

const getObjFromVersion = (
  v: Version,
  type: 'direct' | 'dependency'
): Download => {
  const primary = v.files.filter((f) => f.primary)[0] ?? v.files[0];

  return { name: primary.filename, url: primary.url, type };
};

export const getModrinthDownload = async ({
  id,
  gameVersion,
  loader,
}: ProviderSpecificOptions): Promise<ExportReturnData> => {
  const res = await fetch(
    `https://api.modrinth.com/v2/project/${id}/version?loaders=["${loader}"]&game_versions=["${gameVersion}"]`,
    {
      headers: { 'User-Agent': 'Moddermore/noversion' },
    }
  );

  if (res.status === 404) {
    return [{ error: 'notfound' }];
  }

  const data = (await res.json()) as Version[];

  // a weird fallback mechanism thing

  let latest = data.filter((v) => v.version_type === 'release')[0];
  if (!latest) {
    latest = data.filter((v) => v.version_type === 'beta')[0];
  }
  if (!latest) {
    latest = data.filter((v) => v.version_type === 'alpha')[0];
  }

  if (!latest) return [{ error: 'notfound' }];

  const ret = [];
  ret.push(getObjFromVersion(latest, 'direct'));

  if (latest.dependencies) {
    for (const dep of latest.dependencies.filter(
      (d) => d.dependency_type === 'required'
    )) {
      if (dep.version_id) {
        const v = (await fetch(
          `https://api.modrinth.com/v2/version/${dep.version_id}`
        ).then((r) => r.json())) as Version;

        ret.push(getObjFromVersion(v, 'dependency'));
      } else {
        ret.push(
          ...(await getModrinthDownload({
            id: dep.project_id,
            gameVersion,
            loader,
          }))
        );
      }
    }
  }

  return ret;
};
