import type { NextApiHandler } from 'next';

import { safeParse } from 'valibot';

import { getServerSession } from 'next-auth';
import { authOptions } from '~/lib/authOptions';
import { updateList } from '~/lib/db';

import { ModListUpdate } from '~/types/moddermore';

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

  const parsedData = safeParse(ModListUpdate, req.body);

  if (!parsedData.success) {
    console.error(parsedData.error);
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  try {
    await updateList(
      id,
      parsedData.data,
      sess.user.id,
      sess.extraProfile.isAdmin,
    );
    res.status(200).json({ ok: true });
  } catch {
    res.status(400).json({ ok: false });
  }
};

export default h;
