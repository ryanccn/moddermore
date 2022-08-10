import {
  createClient,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js';

import { getInfo as getModrinthInfo } from '~/lib/metadata/modrinth';
import { getInfo as getCurseForgeInfo } from '~/lib/metadata/curseforge';
import toast from 'react-hot-toast';

import type {
  Mod,
  ModList,
  ModListPartial,
  ModLoader,
  RichMod,
} from '~/types/moddermore';
import type { definitions } from '~/types/supabase';

export const serverClient = () => {
  if (typeof window !== 'undefined') {
    console.warn('SERVER CLIENT BEING USED ON CLIENT! ASDFASDFASDF');
    throw new Error();
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVER_KEY ?? '',
    { shouldThrowOnError: true }
  );
};

export const db = (client: SupabaseClient) =>
  client.from<definitions['mod_lists']>('mod_lists');

const supabaseToList = (orig: definitions['mod_lists']) => {
  const nt = <ModList>{};

  nt.title = orig.title ?? 'Untitled';
  nt.id = orig.id;
  nt.created_at = orig.created_at ?? 'undefined';
  nt.mods = orig.mods as Mod[];
  nt.gameVersion = orig.game_version;
  nt.modloader = orig.modloader as ModLoader;
  nt.author = orig.author ?? null;

  return nt;
};

export const richModToMod = (orig: RichMod): Mod => {
  return { id: orig.id, provider: orig.provider };
};

export const modToRichMod = async (orig: Mod): Promise<RichMod | null> => {
  if (orig.provider === 'modrinth') {
    const info = await getModrinthInfo(orig.id);
    if (info) return info;
  } else if (orig.provider === 'curseforge') {
    const info = await getCurseForgeInfo(orig.id);
    if (info) return info;
  }

  return null;
};

export const getUserLists = async (
  client: SupabaseClient
): Promise<ModList[]> => {
  const ret = await db(client).select('*');

  if (ret.error) {
    toast.error(ret.error.message);
    return [];
  }

  return ret.data
    .map(supabaseToList)
    .sort((a, b) => (new Date(a.created_at) > new Date(b.created_at) ? -1 : 1));
};

export const getSpecificList = async (id: string): Promise<ModList | null> => {
  const ret = await serverClient()
    .from<definitions['mod_lists']>('mod_lists')
    .select('*')
    .eq('id', id);

  if (!ret.data || ret.data.length === 0) {
    return null;
  }

  const dt = ret.data[0];

  return supabaseToList(dt);
};

export const getSpecificListForClient = async (
  client: SupabaseClient,
  id: string
): Promise<ModList | null> => {
  const ret = await client
    .from<definitions['mod_lists']>('mod_lists')
    .select('*')
    .eq('id', id);

  if (!ret.data || ret.data.length === 0) {
    return null;
  }

  const dt = ret.data[0];

  return supabaseToList(dt);
};

export const deleteList = async (client: SupabaseClient, id: string) => {
  console.warn('sadge');
  await db(client).delete().eq('id', id);
};

const genRandomString = () => {
  const data = new Uint8Array(5);
  window.crypto.getRandomValues(data);

  return Array.from(data)
    .map((a) => a.toString(16).padStart(2, '0'))
    .join('');
};

export const createList = async (
  supabaseClient: SupabaseClient,
  list: ModListPartial,
  user: User
): Promise<string> => {
  const id = genRandomString();

  await db(supabaseClient).insert({
    id,
    mods: list.mods,
    created_at: new Date().toISOString(),
    game_version: list.gameVersion,
    modloader: list.modloader,
    title: list.title,
    author: user.id,
  });

  return id;
};

export const updateList = async (
  supabaseClient: SupabaseClient,
  id: string,
  list: ModListPartial,
  user: User
): Promise<string> => {
  await db(supabaseClient)
    .update({
      mods: list.mods,
      created_at: new Date().toISOString(),
      game_version: list.gameVersion,
      modloader: list.modloader,
      title: list.title,
      author: user.id,
    })
    .match({ id });

  return id;
};

export const checkUsername = async (client: SupabaseClient, name: string) => {
  const { count } = await client
    .from<definitions['profiles']>('profiles')
    .select('*', { head: true, count: 'exact' })
    .eq('username', name);

  return count === 0;
};

export const getUsername = async (client: SupabaseClient, id: string) => {
  const { data } = await client
    .from<definitions['profiles']>('profiles')
    .select('*')
    .eq('id', id);

  if (!data || data.length === 0) return null;
  return data[0].username;
};
