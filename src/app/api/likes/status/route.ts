import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { getLikeStatus } from "~/lib/db/users";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return new Response(null, { status: 400 });
  }

  const likes = await getLikeStatus(session.user.id, id);
  return NextResponse.json({ data: likes });
}
