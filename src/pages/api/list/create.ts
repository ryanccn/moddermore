import type { NextApiHandler } from "next";

import { safeParse } from "valibot";

import { getServerSession, type User } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { createList } from "~/lib/db";

import { ModListCreate } from "~/types/moddermore";

import { RESTPostAPIWebhookWithTokenJSONBody as DiscordWebhookBody } from "discord-api-types/rest";
import { loaderFormat } from "~/lib/utils/strings";

const logToDiscord = async ({ data, id, user }: { data: ModListCreate; id: string; user: User }) => {
  if (!process.env.DISCORD_WEBHOOK) return;

  const body = {
    embeds: [
      {
        title: data.title,
        author: {
          name: user.name ? `${user.name} (${user.email})` : user.email ?? `id${user.id}`,
        },
        url: `https://moddermore.net/list/${id}`,
        fields: [
          { name: "Game version", value: data.gameVersion },
          {
            name: "Loader",
            value: loaderFormat(data.modloader),
          },
          {
            name: "Mods",
            value: `**Total (${data.mods.length})**\nModrinth (${
              data.mods.filter((k) => k.provider === "modrinth").length
            })\nCurseForge (${data.mods.filter((k) => k.provider === "curseforge").length})`,
          },
        ],
        // eslint-disable-next-line unicorn/numeric-separators-style
        color: 0x4ade80,
      },
    ],
  } satisfies DiscordWebhookBody;

  await fetch(process.env.DISCORD_WEBHOOK, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
};

const h: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const sess = await getServerSession(req, res, authOptions);

  if (!sess?.user.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsedData = safeParse(ModListCreate, req.body);

  if (!parsedData.success) {
    res.status(400).json({ error: "Bad request" });
    return;
  }

  const listId = await createList(parsedData.output, sess.user.id);
  res.status(200).json({ id: listId });

  await logToDiscord({ data: parsedData.output, id: listId, user: sess.user });
};

export default h;
