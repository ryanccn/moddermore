import type { NextApiHandler } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { deleteList } from "~/lib/db";

const h: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const sess = await getServerSession(req, res, authOptions);

  if (!sess?.user.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = req.query.id;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const lists = await deleteList(id, sess.user.id, sess.extraProfile.isAdmin);
  res.status(200).json(lists);
};

export default h;
