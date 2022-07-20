import type { NextApiHandler } from 'next';
import { getCount } from '~/lib/supabase';

const h: NextApiHandler = async (_, res) => {
  const count = await getCount();

  res.setHeader('cache-control', 's-maxage=60, stale-while-revalidate=3600');
  res.json({ count });
};

export default h;
