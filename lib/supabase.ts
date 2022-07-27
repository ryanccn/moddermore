import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

import type {
  Mod,
  ModList,
  ModListPartial,
  ModLoader,
} from '~/types/moddermore';
import type { definitions } from '~/types/supabase';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing environment variables: SUPABASE_URL or SUPABASE_KEY!'
  );
}

const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  shouldThrowOnError: true,
});
const db = supabaseClient.from<definitions['mod_lists']>('mod_lists');

export const getCount = async (): Promise<number> => {
  const count = await db
    .select('id', { count: 'exact', head: true })
    .then((res) => res.count);

  return count ?? 0;
};

export const getSpecificList = async (id: string): Promise<ModList | null> => {
  const ret = await db.select('*').eq('id', id);

  if (!ret.data || ret.data.length === 0) {
    console.error('debug', { id, ret });
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

export const createList = async (list: ModListPartial): Promise<string> => {
  const id = randomBytes(5).toString('hex');

  await db.insert({
    id,
    mods: list.mods,
    created_at: new Date().toISOString(),
    game_version: list.gameVersion,
    modloader: list.modloader,
    title: list.title,
  });

  return id;
};
