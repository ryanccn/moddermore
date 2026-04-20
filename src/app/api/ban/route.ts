import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import * as v from "valibot";
import { authOptions } from "~/lib/authOptions";
import { getListsCollection, getProfilesCollection } from "~/lib/db/client";

const validate = v.strictObject({ id: v.pipe(v.string(), v.minLength(1)) });

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const parsedBody = v.safeParse(validate, body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { id: banId } = parsedBody.output;

  const sess = await getServerSession(authOptions);
  if (!sess?.extraProfile.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profiles = await getProfilesCollection();
  await profiles.updateOne({ userId: banId }, { $set: { banned: true } });

  const lists = await getListsCollection();
  await lists.deleteMany({ owner: banId });

  return NextResponse.json({ ok: true });
}
