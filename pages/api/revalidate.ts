import { type NextApiHandler } from 'next';

const h: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false });
    return;
  }

  if (!req.query || !req.query.id || typeof req.query.id !== 'string') {
    res.status(400).json({ ok: false });
    return;
  }

  await res.revalidate(`/list/${encodeURIComponent(req.query.id)}`);
  res.status(200).json({ ok: true });
};

export default h;
