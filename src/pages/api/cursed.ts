export const config = {
  runtime: 'edge',
};

const h = async (req: Request) => {
  const originalURL = new URL(req.url).searchParams.get('url');

  if (!originalURL) {
    return new Response("didn't provide anything", {
      status: 404,
      headers: { 'content-type': 'text/plain' },
    });
  }

  if (!new URL(originalURL).hostname.endsWith('forgecdn.net')) {
    return new Response('only forgecdn.net links work', {
      status: 400,
      headers: { 'content-type': 'text/plain' },
    });
  }

  const proxiedResp = await fetch(originalURL, {
    headers: {
      'User-Agent': req.headers.get('User-Agent') ?? '',
      Referer: req.headers.get('Referer') ?? '',
    },
  });

  return proxiedResp.clone();
};

export default h;
