import type { NextApiHandler } from 'next';
import { getCount } from '~/lib/supabase';

const h: NextApiHandler = async (_, res) => {
  const count = await getCount();

  res.json({ count });
};

export default h;
