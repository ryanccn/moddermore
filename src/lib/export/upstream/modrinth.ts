import type { ModrinthVersion } from "~/types/modrinth";
import type { Download, ExportReturnData, ProviderSpecificOptions } from "./types";

import { remoteFetch } from "~/lib/utils/remoteFetch";
import minecraftVersions from "~/lib/minecraftVersions.json";

const getObjFromVersion = (v: ModrinthVersion, type: "direct" | "dependency"): Download => {
  const primary = v.files.find((f) => f.primary) ?? v.files[0];

  return {
    provider: "modrinth",
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
    const res = await remoteFetch(`https://api.modrinth.com/v2/version/${encodeURIComponent(version)}`);

    if (!res.ok) return null;

    const data = (await res.json()) as ModrinthVersion;

    return data;
  }

  const res = await remoteFetch(
    `https://api.modrinth.com/v2/project/${encodeURIComponent(id)}/version?loaders=["${encodeURIComponent(
      loader,
    )}"]&game_versions=[${encodeURIComponent(gameVersions.map((a) => `"${a}"`).join(","))}]`,
  );

  if (!res.ok) return null;

  const data = (await res.json()) as ModrinthVersion[];

  let latest = data.find((v) => v.version_type === "release");
  if (!latest) {
    latest = data.find((v) => v.version_type === "beta");
  }
  if (!latest) {
    latest = data.find((v) => v.version_type === "alpha");
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

  if (!latest && loader === "quilt") {
    latest = await callModrinthAPI({
      id,
      gameVersions,
      loader: "fabric",
      name,
      version,
    });
  }

  if (!latest && loader === "neoforge") {
    latest = await callModrinthAPI({
      id,
      gameVersions,
      loader: "forge",
      name,
      version,
    });
  }

  const compatGameVersions = minecraftVersions.snapshots.includes(gameVersions[0])
    ? []
    : minecraftVersions.releases.filter((a) =>
        a.startsWith(gameVersions[0].split(".").slice(0, 2).join(".")),
      );

  if (!latest) {
    latest = await callModrinthAPI({
      id,
      gameVersions: compatGameVersions,
      loader,
      name,
      version,
    });
  }

  if (!latest && loader === "quilt") {
    latest = await callModrinthAPI({
      id,
      gameVersions: compatGameVersions,
      loader: "fabric",
      name,
      version,
    });
  }

  if (!latest && loader === "neoforge") {
    latest = await callModrinthAPI({
      id,
      gameVersions: compatGameVersions,
      loader: "forge",
      name,
      version,
    });
  }

  if (!latest) {
    return [{ error: "notfound", name, id }];
  }

  return [getObjFromVersion(latest, "direct")];
};
