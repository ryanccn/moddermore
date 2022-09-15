import { getInfo as getModrinthInfo } from '~/lib/metadata/modrinth';
import { getInfo as getCurseForgeInfo } from '~/lib/metadata/curseforge';

import { v4 as generateUUID } from '@lukeed/uuid/secure';

import { getListsCollection } from './client';
import type { Mod, ModList, ModListPartial, RichMod } from '~/types/moddermore';

export const richModToMod = (orig: RichMod): Mod => {
  return { id: orig.id, provider: orig.provider };
};

export const modToRichMod = async (orig: Mod): Promise<RichMod | null> => {
  if (orig.provider === 'modrinth') {
    const info = await getModrinthInfo(orig.id);
    if (info) return info;
  } else if (orig.provider === 'curseforge') {
    const info = await getCurseForgeInfo(orig.id);
    if (info) return info;
  }

  return null;
};

export const getUserLists = async (userId: string): Promise<ModList[]> => {
  const collection = await getListsCollection();
  const lists = await collection.find({ owner: userId }).toArray();

  return lists.sort((a, b) =>
    new Date(a.created_at) > new Date(b.created_at) ? -1 : 1
  );
};

export const getSpecificList = async (id: string): Promise<ModList | null> => {
  const collection = await getListsCollection();
  const list = await collection.findOne({ id });

  return list;
};

export const deleteList = async (
  id: string,
  userId: string
): Promise<boolean> => {
  const collection = await getListsCollection();
  const res = await collection.deleteOne({ id, owner: userId });

  return !!res.deletedCount;
};

const genRandomString = (): string => {
  return generateUUID().replaceAll('-', '').substring(0, 10);
};

export const createList = async (
  list: ModListPartial,
  userId: string
): Promise<string> => {
  const collection = await getListsCollection();
  const id = genRandomString();

  await collection.insertOne({
    ...list,
    id,
    owner: userId,
    created_at: new Date().toISOString(),
  });

  return id;
};

export const updateList = async (
  id: string,
  list: ModListPartial,
  userId: string
): Promise<boolean> => {
  const collection = await getListsCollection();
  const res = await collection.updateOne({ id, owner: userId }, list);

  return !!res.modifiedCount;
};
