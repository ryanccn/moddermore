export const runtime = "edge";

export async function GET(request: Request) {
  const originalURL = new URL(request.url).searchParams.get("url");

  if (!originalURL) {
    return new Response(null, { status: 404 });
  }

  if (!new URL(originalURL).hostname.endsWith("forgecdn.net")) {
    return new Response(null, { status: 400 });
  }

  const proxiedResp = await fetch(originalURL, {
    headers: {
      "user-agent": request.headers.get("user-agent") ?? "",
      "x-api-key": process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY,
    },
  });

  return proxiedResp.clone();
}
