import { createClient } from '@supabase/supabase-js';

import type { Mod, ModList } from './extra.types';
import type { definitions } from './supabase.types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing environment variables: SUPABASE_URL or SUPABASE_KEY!'
  );
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);
type supabaseTypes = definitions;
const db = supabaseClient.from<supabaseTypes['mod_lists']>('mod_lists');

export const getCount = async (): Promise<number> => {
  const count = await db
    .select('id', { count: 'exact' })
    .throwOnError()
    .then((res) => res.count);

  return count ?? 0;
};

export const getSpecificList = async (id: string): Promise<ModList | null> => {
  const ret = await db.select('*').eq('id', id).throwOnError();

  if (!ret.data || ret.data.length === 0) {
    return null;
  }

  const dt = ret.data[0];
  const nt = <ModList>{};

  nt.title = dt.title ?? 'Untitled';
  nt.id = dt.id;
  nt.created_at = dt.created_at ?? 'undefined';
  nt.mods = dt.mods as Mod[];

  return nt;
};
