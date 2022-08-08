import { type NextApiHandler } from 'next';
import { db, serverClient } from '~/lib/supabase';

const h: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'bad method' });
    return;
  }

  const users = await serverClient().auth.api.listUsers();
  const userCount = users.data?.length ?? 0;

  const listCount = await db(serverClient())
    .select('*', {
      count: 'exact',
      head: true,
    })
    .then((ret) => ret.count ?? 0);

  res.setHeader('cache-control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json({ users: userCount, lists: listCount });
};

export default h;
