export const runtime = "edge";

export async function GET(request: Request) {
  const originalURL = new URL(request.url).searchParams.get("url");

  if (!originalURL) {
    return new Response("didn't provide anything", {
      status: 404,
      headers: { "content-type": "text/plain" },
    });
  }

  if (!new URL(originalURL).hostname.endsWith("forgecdn.net")) {
    return new Response("only forgecdn.net links work", {
      status: 400,
      headers: { "content-type": "text/plain" },
    });
  }

  const proxiedResp = await fetch(originalURL, {
    headers: {
      "User-Agent": request.headers.get("User-Agent") ?? "",
      Referer: request.headers.get("Referer") ?? "",
    },
  });

  return proxiedResp.clone();
}
