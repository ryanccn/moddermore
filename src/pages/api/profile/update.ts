import type { NextApiHandler } from "next";

import { getServerSession } from "next-auth";
import { safeParse } from "valibot";
import { authOptions } from "~/lib/authOptions";

import { updateUserProfile } from "~/lib/db/users";
import { UserEditableProfileData } from "~/types/moddermore";

const h: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  const parsedBody = safeParse(UserEditableProfileData, req.body);

  if (!parsedBody.success) {
    res.status(400).end();
    return;
  }

  await updateUserProfile(session.user.id, parsedBody.data);

  res.status(200).end();
};

export default h;
