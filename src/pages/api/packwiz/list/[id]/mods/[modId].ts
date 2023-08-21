import { type JsonMap, stringify } from "@iarna/toml";
import type { NextApiHandler } from "next";

import { getSpecificList } from "~/lib/db";
import { getCurseForgeTOML, getModrinthTOML } from "~/lib/export/formats/packwiz";

const h: NextApiHandler = async (req, res) => {
  if (
    typeof req.query.id !== "string"
    || typeof req.query.modId !== "string"
    || !(
      req.query.modId.startsWith("modrinth-")
      || req.query.modId.startsWith("curseforge-")
    )
    || !req.query.modId.endsWith(".pw.toml")
  ) {
    res.status(400).end();
    return;
  }

  const modId = req.query.modId.replace(".pw.toml", "");
  const [provider, id] = modId.split("-");

  const list = await getSpecificList(req.query.id);

  if (!list || list.visibility === "private" || list.ownerProfile.banned) {
    res.status(404).end();
    return;
  }

  res.setHeader("content-type", "application/toml; charset=utf-8");
  res.setHeader("cache-control", "s-maxage=3600");

  let data = null;

  if (provider === "modrinth") {
    data = await getModrinthTOML({
      id,
      gameVersions: [list.gameVersion],
      loader: list.modloader,
      name: "",
    });
  } else if (provider === "curseforge") {
    data = await getCurseForgeTOML({
      id,
      gameVersions: [list.gameVersion],
      loader: list.modloader,
      name: "",
    });
  }

  if (!data) {
    res.status(404).end();
    return;
  }

  res.send(stringify(data as unknown as JsonMap));
};

export default h;
