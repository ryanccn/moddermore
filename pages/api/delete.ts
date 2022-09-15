import type { NextApiHandler } from 'next';

import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { deleteList } from '~/lib/db';

const h: NextApiHandler = async (req, res) => {
  const sess = await unstable_getServerSession(req, res, authOptions);

  if (!sess?.user?.email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const id = req.query.id;

  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  const lists = await deleteList(id, sess?.user?.email);
  res.status(200).json(lists);
};

export default h;
