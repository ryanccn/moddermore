import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import pLimit from "p-limit";
import * as v from "valibot";
import { authOptions } from "~/lib/authOptions";

import { getSpecificList } from "~/lib/db";
import { getListsCollection } from "~/lib/db/client";
import type { ModList } from "~/types/moddermore";

const lim = pLimit(12);

const search = async (query: string, isAdmin?: boolean) => {
  const collection = await getListsCollection();
  const resp = collection.aggregate<ModList>([
    {
      $search: {
        index: "search_index",
        text: {
          query,
          path: ["title", "description"],
        },
      },
    },
    ...(isAdmin
      ? []
      : [
          {
            $match: {
              visibility: "public",
            },
          },
        ]),
  ]);

  const arr = await resp.toArray();
  return Promise.all(arr.map((k) => lim(() => getSpecificList(k.id)))).then((k) => k.filter(Boolean));
};

const validate = v.strictObject({ query: v.pipe(v.string(), v.minLength(1)) });

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const parsedBody = v.safeParse(validate, body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { query } = parsedBody.output;
  const sess = await getServerSession(authOptions);
  const searchResults = await search(query, sess?.extraProfile?.isAdmin);
  return NextResponse.json(searchResults);
}
