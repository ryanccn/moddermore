import { type NextProxy, NextResponse } from "next/server";

import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export const config = {
  matcher: "/api/search",
};

const proxy: NextProxy = async (request, event) => {
  const ip = request.headers.get("x-real-ip") ?? "127.0.0.1";

  const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
  event.waitUntil(pending);

  const rateLimitHeaders = new Headers();
  rateLimitHeaders.set("x-rate-limit-limit", limit.toString());
  rateLimitHeaders.set("x-rate-limit-reset", reset.toString());
  rateLimitHeaders.set("x-rate-limit-remaining", remaining.toString());

  return success
    ? NextResponse.next({ headers: rateLimitHeaders })
    : new Response(null, { status: 429, headers: rateLimitHeaders });
};

export default proxy;
