import type { NextApiHandler } from 'next';
import { search, optionsZ } from '~/lib/search';

const h: NextApiHandler = async (req, res) => {
  if (!req.query) {
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  const parsedInput = optionsZ.safeParse({
    platform: req.query['platform'],
    query: req.query['query'],
    loader: req.query['loader'],
    gameVersion: req.query['gameVersion'],
  });

  if (!parsedInput.success) {
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  const ret = await search(parsedInput.data);

  res.setHeader('cache-control', 's-maxage=60, stale-while-revalidate=3600');
  res.json(ret);
};

export default h;
