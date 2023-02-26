import type { NextApiHandler } from 'next';

import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

import { updateUserProfile } from '~/lib/db/users';
import { userEditableProfileDataZod } from '~/types/moddermore';

const h: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  const parsedBody = userEditableProfileDataZod.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).end();
    return;
  }

  await updateUserProfile(session.user.id, parsedBody.data);

  res.status(200).end();
};

export default h;
