import { getListsCollection, getUsersCollection } from "~/lib/db/client";

const plausibleUrl =
  "https://plausible.io/api/v1/stats/aggregate?metrics=pageviews&site_id=moddermore.net&period=30d";

export const getPageviews = async (): Promise<number | null> => {
  if (!process.env.PLAUSIBLE_TOKEN) return null;

  const {
    results: {
      pageviews: { value },
    },
  } = await fetch(plausibleUrl, {
    headers: { Authorization: `Bearer ${process.env.PLAUSIBLE_TOKEN}` },
  }).then(async (r) => {
    if (!r.ok) {
      throw new Error(
        `Error fetching ${r.url}: ${r.status} ${r.statusText}\n${await r.text()}`,
      );
    }

    return r.json();
  });

  return value;
};

export const getUsers = async (): Promise<number> => {
  const db = await getUsersCollection();
  return db.countDocuments();
};

export const getLists = async (): Promise<number> => {
  const db = await getListsCollection();
  return db.countDocuments();
};
