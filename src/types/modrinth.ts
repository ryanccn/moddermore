type Side = 'required' | 'optional' | 'unsupported';

export interface ModrinthProject {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  client_side: Side;
  server_side: Side;
  project_type: 'mod' | 'modpack';
  downloads: number;
  icon_url: string | null;
  id: string;
  team: string;
  game_versions?: string[];
}

export interface ModrinthVersion {
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

export interface ModrinthSearchResult {
  hits: {
    slug: string;
    title: string;
    description: string;
    categories: string[];
    project_type: 'mod';
    downloads: number;
    icon_url: string;
    project_id: string;
    author: string;
    versions: string[];
    follows: number;
    date_created: string;
    date_modified: string;
    latest_version: string;
    license: string;
    gallery: string[];
  }[];

  offset: number;
  limit: number;
  total_hits: number;
}
