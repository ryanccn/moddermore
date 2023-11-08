import type { NextApiHandler } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { getUserLists } from "~/lib/db";

const h: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const sess = await getServerSession(req, res, authOptions);

  if (!sess) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const lists = await getUserLists(sess.user.id);
  res.status(200).json(lists);
};

export default h;
