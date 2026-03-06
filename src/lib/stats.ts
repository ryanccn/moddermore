import { getListsCollection, getUsersCollection } from "~/lib/db/client";

export const getUsers = async (): Promise<number> => {
  const col = await getUsersCollection();
  return col.countDocuments();
};

export const getLists = async (): Promise<number> => {
  const col = await getListsCollection();
  return col.countDocuments();
};

export const getMods = async (): Promise<number> => {
  const col = await getListsCollection();
  const doc = await col
    .aggregate([
      {
        $group: {
          _id: null,
          totalMods: { $sum: { $size: "$mods" } },
        },
      },
    ])
    .next();

  return doc ? (doc.totalMods as number) : 0;
};
