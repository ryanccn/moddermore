import type { NextApiHandler } from 'next';

import { getSpecificList } from '~/lib/db';

const h: NextApiHandler = async (req, res) => {
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
  res.status(200).setHeader('cache-control', 's-maxage=2').json(list);
};

export default h;
