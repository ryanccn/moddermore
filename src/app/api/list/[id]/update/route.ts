import { NextResponse } from "next/server";
import { safeParse } from "valibot";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { updateList } from "~/lib/db";
import { ModListUpdate } from "~/types/moddermore";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await getServerSession(authOptions);

  if (!sess?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as unknown;
  const parsedData = safeParse(ModListUpdate, body);

  if (!parsedData.success) {
    console.error(parsedData.issues);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    await updateList(id, parsedData.output, sess.user.id, sess.extraProfile.isAdmin);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
