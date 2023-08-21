import type { ModLoader } from "~/types/moddermore";

export interface ProviderSpecificOptions {
  id: string;
  name: string;
  loader: ModLoader;
  gameVersions: string[];
  version?: string;
}

export interface ModrinthDownload {
  name: string;
  id: string;
  url: string;
  type: "direct" | "dependency";
  provider: "modrinth";
  fileSize: number;
  hashes: {
    sha1: string;
    sha512: string;
  };
  displayName: string;
  version: string;
}

export interface CurseForgeDownload {
  name: string;
  id: string;
  url: string;
  type: "direct" | "dependency";
  provider: "curseforge";
  fileSize: number;
  sha1: string;
  projectId: number;
  fileId: number;
  displayName: string;
}

export type Download = ModrinthDownload | CurseForgeDownload;

export interface DownloadError {
  error: "unavailable" | "notfound";
  name: string;
  id: string;
}

export type ExportReturnData = (Download | DownloadError)[];
