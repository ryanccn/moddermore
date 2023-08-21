import { type NextApiHandler } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { getLikeStatus } from "~/lib/db/users";

const h: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).end();
    return;
  }

  if (typeof req.query.id !== "string") {
    res.status(400).end();
    return;
  }

  const likes = await getLikeStatus(session.user.id, req.query.id);

  res.status(200).send({ data: likes });
};

export default h;
