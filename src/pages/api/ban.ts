import { type NextApiHandler } from 'next';
import { getServerSession } from 'next-auth';

import { z } from 'zod';
import { authOptions } from '~/lib/authOptions';
import { getProfilesCollection } from '~/lib/db/client';

const validate = z.object({ id: z.string().min(1) });

const handler: NextApiHandler = async (req, res) => {
  const parsedBody = validate.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: 'bad request' });
    return;
  }

  const {
    data: { id: banId },
  } = parsedBody;

  const sess = await getServerSession(req, res, authOptions);
  if (!sess?.extraProfile.isAdmin) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const profiles = await getProfilesCollection();
  await profiles.updateOne({ userId: banId }, { $set: { banned: true } });

  res.json({ ok: true });
};

export default handler;
