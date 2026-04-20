import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { deleteList } from "~/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await getServerSession(authOptions);

  if (!sess?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteList(id, sess.user.id, sess.extraProfile.isAdmin);
  return NextResponse.json(result);
}
