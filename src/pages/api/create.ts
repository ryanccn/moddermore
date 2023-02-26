import type { NextApiHandler } from 'next';

import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { createList } from '~/lib/db';
import { modListPartialZod } from '~/types/moddermore';

const h: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const sess = await getServerSession(req, res, authOptions);

  if (!sess?.user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parsedData = modListPartialZod.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  const lists = await createList(parsedData.data, sess.user.id);
  res.status(200).json({ id: lists });
};

export default h;
