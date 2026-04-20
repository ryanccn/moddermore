import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { getUserLists } from "~/lib/db";

export async function GET() {
  const sess = await getServerSession(authOptions);

  if (!sess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lists = await getUserLists(sess.user.id);
  return NextResponse.json(lists);
}
