import type { NextApiHandler } from 'next';

const h: NextApiHandler = async (req, res) => {
  const urlToRevalidate = req.query.url;

  if (!urlToRevalidate || typeof urlToRevalidate !== 'string') {
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  await res.revalidate(urlToRevalidate);

  res.json({ ok: true });
};

export default h;
