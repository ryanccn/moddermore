import type { NextApiHandler } from 'next';

import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { updateList } from '~/lib/db';
import { modListPartialZod } from '~/types/moddermore';

const h: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const sess = await unstable_getServerSession(req, res, authOptions);

  const id = req.query.id;

  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  if (!sess?.user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parsedData = modListPartialZod.safeParse(req.body);

  if (!parsedData.success) {
    console.error(parsedData.error.errors);
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  const ok = await updateList(id, parsedData.data, sess.user.id);

  if (ok) res.status(200).json({ ok: true });
  else res.status(400).json({ ok: false });
};

export default h;
