export const config = {
  runtime: 'experimental-edge',
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
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36',
    },
  });

  if (!proxiedResp.ok) {
    return new Response(proxiedResp.body, {
      status: proxiedResp.status,
      headers: {
        'content-type': proxiedResp.headers.get('content-type') ?? '',
      },
    });
  }

  return new Response(proxiedResp.body, {
    headers: {
      'cache-control': 's-maxage=3600, stale-while-revalidate=3600',
      'content-type': proxiedResp.headers.get('content-type') ?? '',
    },
  });
};

export default h;
