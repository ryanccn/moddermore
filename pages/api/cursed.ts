import type { NextApiHandler } from 'next';

const h: NextApiHandler = async (req, res) => {
  const originalURL = req.query.original;

  if (!originalURL || typeof originalURL !== 'string') {
    res.status(404).json({ error: 'what?' });
    return;
  }

  if (!new URL(originalURL).hostname.includes('forgecdn.net')) {
    res.status(400).json({ error: 'not forgecdn.net, go away' });
    return;
  }

  const proxiedResp = await fetch(originalURL);

  res.setHeader('cache-control', 's-maxage=60, stale-while-revalidate=3600');
  res.setHeader('content-type', proxiedResp.headers.get('content-type') ?? '');
  res.end(await proxiedResp.blob().then((blob) => blob.arrayBuffer()));
};

export default h;
