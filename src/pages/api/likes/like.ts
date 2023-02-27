import { type NextApiHandler } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/lib/authOptions';
import { like } from '~/lib/db/users';

const h: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).end();
    return;
  }

  if (typeof req.query.id !== 'string') {
    res.status(400).end();
    return;
  }

  const ok = await like(session.user.id, req.query.id);

  if (ok) {
    res.status(201).end();
  } else {
    res.status(500).end();
  }
};

export default h;
