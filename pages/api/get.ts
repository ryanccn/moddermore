import type { NextApiHandler } from 'next';

import { getSpecificList } from '~/lib/db';
import type { ModList } from '~/types/moddermore';

const h: NextApiHandler<ModList | { error: string }> = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const id = req.query.id;

  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  const list = await getSpecificList(id);
  if (!list) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  res
    .status(200)
    .setHeader('cache-control', 's-maxage=2')
    .json(!list.legacy ? list : { ...list, legacy: 'redacted' });
};

export default h;
