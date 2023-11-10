import { type NextApiHandler } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
// import { getUserProfile } from '~/lib/db/users';

import pLimit from "p-limit";
import { getSpecificListByID } from "~/lib/db";

const h: NextApiHandler = async (req, res) => {
  const sess = await getServerSession(req, res, authOptions);

  if (!sess) {
    res.status(401).end();
    return;
  }

  const likes = sess.extraProfile.likes ?? [];

  const lim = pLimit(12);

  const likedLists = await Promise.all(
    likes.map((likedListId) => lim(() => getSpecificListByID(likedListId))),
  ).then((r) => r.filter(Boolean));

  res.json(likedLists);
};

export default h;
