import type { NextApiHandler } from 'next';

import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { getSpecificList, updateList } from '~/lib/db';
import { modListUpdateZod } from '~/types/moddermore';

const h: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const sess = await getServerSession(req, res, authOptions);

  const id = req.query.id;

  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  if (!sess?.user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parsedData = modListUpdateZod.safeParse(req.body);

  if (!parsedData.success) {
    console.error(parsedData.error.errors);
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  if (sess.extraProfile.plan !== 'pro' && parsedData.data.customSlug) {
    res
      .status(403)
      .json({ error: 'Forbidden to use custom slug on free plan' });
  }

  if (
    parsedData.data.customSlug &&
    (await getSpecificList(parsedData.data.customSlug))
  ) {
    res.status(400).json({ error: 'List already exists with custom URL' });
  }

  const ok = await updateList(id, parsedData.data, sess.user.id);

  if (ok) res.status(200).json({ ok: true });
  else res.status(400).json({ ok: false });
};

export default h;
