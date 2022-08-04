import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient, type User } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

import type {
  Mod,
  ModList,
  ModListPartial,
  ModLoader,
} from '~/types/moddermore';
import type { definitions } from '~/types/supabase';

const serverClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVER_KEY ?? '',
    { shouldThrowOnError: true }
  );

const db = supabaseClient.from<definitions['mod_lists']>('mod_lists');

export const getUserLists = async (): Promise<ModList[]> => {
  const ret = await db.select('*');

  if (ret.error) {
    console.error(ret.error);
    return [];
  }

  return ret.data.map((item) => {
    const nt = <ModList>{};

    nt.title = item.title ?? 'Untitled';
    nt.id = item.id;
    nt.created_at = item.created_at ?? 'undefined';
    nt.mods = item.mods as Mod[];
    nt.gameVersion = item.game_version;
    nt.modloader = item.modloader as ModLoader;

    return nt;
  });
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
  const nt = <ModList>{};

  nt.title = dt.title ?? 'Untitled';
  nt.id = dt.id;
  nt.created_at = dt.created_at ?? 'undefined';
  nt.mods = dt.mods as Mod[];
  nt.gameVersion = dt.game_version;
  nt.modloader = dt.modloader as ModLoader;

  return nt;
};

export const createList = async (
  list: ModListPartial,
  user: User
): Promise<string> => {
  const id = randomBytes(5).toString('hex');

  await db.insert({
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

export const addUsername = async (user: User, name: string) => {
  await supabaseClient
    .from<definitions['profiles']>('profiles')
    .insert({ id: user.id, username: name });
};

export const checkUsername = async (name: string) => {
  const { count } = await supabaseClient
    .from<definitions['profiles']>('profiles')
    .select('*', { head: true, count: 'exact' })
    .eq('username', name);

  return count === 0;
};

export const getUsername = async (user: User) => {
  const { data } = await supabaseClient
    .from<definitions['profiles']>('profiles')
    .select('*')
    .eq('id', user.id);

  if (!data || data.length === 0) return null;
  return data[0].username;
};
