import { NextResponse } from "next/server";
import { safeParse } from "valibot";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { createList } from "~/lib/db";
import { ModListCreate } from "~/types/moddermore";
import type { RESTPostAPIWebhookWithTokenJSONBody as DiscordWebhookBody } from "discord-api-types/rest";
import { loaderFormat } from "~/lib/utils/strings";

const logToDiscord = async ({ data, id, user }: { data: ModListCreate; id: string; user: User }) => {
  if (!process.env.DISCORD_WEBHOOK) return;

  const body = {
    embeds: [
      {
        title: data.title,
        author: {
          name: user.name ? `${user.name} (${user.email})` : (user.email ?? `id${user.id}`),
        },
        url: `https://moddermore.net/list/${id}`,
        fields: [
          { name: "Game version", value: data.gameVersion },
          { name: "Loader", value: loaderFormat(data.modloader) },
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

export async function POST(request: Request) {
  const sess = await getServerSession(authOptions);

  if (!sess?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsedData = safeParse(ModListCreate, body);

  if (!parsedData.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const listId = await createList(parsedData.output, sess.user.id);

  await logToDiscord({ data: parsedData.output, id: listId, user: sess.user });

  return NextResponse.json({ id: listId });
}
