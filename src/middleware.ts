import { NextMiddleware, NextResponse } from "next/server";

import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export const config = {
  matcher: "/api/search",
};

const middleware: NextMiddleware = async (request, event) => {
  const ip = request.ip ?? "127.0.0.1";

  const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
  event.waitUntil(pending);

  const rateLimitHeaders = new Headers();
  rateLimitHeaders.set("x-rate-limit-limit", `${limit}`);
  rateLimitHeaders.set("x-rate-limit-reset", `${reset}`);
  rateLimitHeaders.set("x-rate-limit-remaining", `${remaining}`);

  return success
    ? NextResponse.next({ headers: rateLimitHeaders })
    : new Response(null, { status: 429, headers: rateLimitHeaders });
};

export default middleware;
