import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import pLimit from "p-limit";
import { getSpecificListByID } from "~/lib/db";

export async function GET() {
  const sess = await getServerSession(authOptions);

  if (!sess) {
    return new Response(null, { status: 401 });
  }

  const likes = sess.extraProfile.likes ?? [];
  const lim = pLimit(12);

  const likedLists = await Promise.all(
    likes.map((likedListId) => lim(() => getSpecificListByID(likedListId))),
  ).then((r) => r.filter(Boolean));

  return NextResponse.json(likedLists);
}
