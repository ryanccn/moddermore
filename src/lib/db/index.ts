import { nanoid } from 'nanoid/async';

import { getListsCollection, getProfilesCollection } from './client';
import type {
  ModList,
  ModListCreate,
  ModListUpdate,
  ModListWithExtraData,
} from '~/types/moddermore';
import { getUserProfile } from './users';

export const getUserLists = async (userId: string): Promise<ModList[]> => {
  const collection = await getListsCollection();
  const lists = await collection.find({ owner: userId }).toArray();

  return lists.sort((a, b) =>
    new Date(a.created_at) > new Date(b.created_at) ? -1 : 1,
  );
};

export const getLegacyUserLists = async (email: string): Promise<ModList[]> => {
  const collection = await getListsCollection();
  const lists = await collection.find({ legacy: email }).toArray();

  return lists.sort((a, b) =>
    new Date(a.created_at) > new Date(b.created_at) ? -1 : 1,
  );
};

export const getSpecificListByID = async (trueId: string) => {
  const collection = await getListsCollection();
  return await collection.findOne({ id: trueId });
};

export const getSpecificList = async (
  id: string,
): Promise<ModListWithExtraData | null> => {
  const collection = await getListsCollection();
  const list = await collection.findOne({ id });
  if (!list) return null;
  const ownerProfile = list.owner ? await getUserProfile(list.owner) : null;

  const profilesCollection = await getProfilesCollection();
  const likeCount = await profilesCollection.countDocuments({ likes: id });

  return {
    id: list.id,
    title: list.title,
    description: list.description,
    mods: list.mods,
    gameVersion: list.gameVersion,
    modloader: list.modloader,
    owner: list.owner,
    created_at: list.created_at,
    visibility: list.visibility,
    likes: likeCount,
    ownerProfile: ownerProfile
      ? {
          ...(ownerProfile.name ? { name: ownerProfile.name } : {}),
          ...(ownerProfile.profilePicture
            ? { profilePicture: ownerProfile.profilePicture }
            : {}),
        }
      : {},
  };
};

export const deleteList = async (
  id: string,
  userId: string,
): Promise<boolean> => {
  const collection = await getListsCollection();
  const res = await collection.deleteOne({ id, owner: userId });

  return !!res.deletedCount;
};

export const createList = async (
  list: ModListCreate,
  userId: string,
): Promise<string> => {
  const collection = await getListsCollection();
  const id = await nanoid(12);

  await collection.insertOne({
    ...list,
    id,
    description: list.description ?? null,
    owner: userId,
    created_at: new Date().toISOString(),
    visibility: 'unlisted',
  });

  return id;
};

export const updateList = async (
  id: string,
  list: ModListUpdate,
  userId: string,
): Promise<boolean> => {
  const collection = await getListsCollection();
  const res = await collection.updateOne({ id, owner: userId }, { $set: list });

  return !!res.modifiedCount;
};
