import type { NextApiHandler } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { getSpecificList } from "~/lib/db";
import { getListTimeseries } from "~/lib/listAnalytics";

const h: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const sess = await getServerSession(req, res, authOptions);

  const id = req.query.id;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  if (!sess?.user.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const listData = await getSpecificList(id);
  if (!listData) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (sess.user.id !== listData.owner && !sess.extraProfile.isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const timeseriesData = await getListTimeseries(id);
  res.json({
    timeseries: timeseriesData,
  });
};

export default h;
