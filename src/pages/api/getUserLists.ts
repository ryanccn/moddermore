import type { NextApiHandler } from 'next';

import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { getLegacyUserLists, getUserLists } from '~/lib/db';

const h: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const sess = await unstable_getServerSession(req, res, authOptions);

  if (!sess) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const lists = await getUserLists(sess.user.id);
  const legacyLists = await getLegacyUserLists(sess.user.email);

  res.status(200).json([...lists, ...legacyLists]);
};

export default h;
