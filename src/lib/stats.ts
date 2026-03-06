import { getListsCollection, getUsersCollection } from "~/lib/db/client";

export const getUsers = async (): Promise<number> => {
  const db = await getUsersCollection();
  return db.countDocuments();
};

export const getLists = async (): Promise<number> => {
  const db = await getListsCollection();
  return db.countDocuments();
};
