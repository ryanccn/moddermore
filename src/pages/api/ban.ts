import { type NextApiHandler } from "next";
import { getServerSession } from "next-auth";

import * as v from "valibot";
import { authOptions } from "~/lib/authOptions";
import { getListsCollection, getProfilesCollection } from "~/lib/db/client";

const validate = v.object({ id: v.pipe(v.string(), v.minLength(1)) });

const handler: NextApiHandler = async (req, res) => {
  const parsedBody = v.safeParse(validate, req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "bad request" });
    return;
  }

  const {
    output: { id: banId },
  } = parsedBody;

  const sess = await getServerSession(req, res, authOptions);
  if (!sess?.extraProfile.isAdmin) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const profiles = await getProfilesCollection();
  await profiles.updateOne({ userId: banId }, { $set: { banned: true } });

  const lists = await getListsCollection();
  await lists.deleteMany({ owner: banId });

  res.json({ ok: true });
};

export default handler;
