import { v4 as generateUUID } from '@lukeed/uuid/secure';

import { getListsCollection } from './client';
import type {
  ModList,
  ModListCreateType,
  ModListUpdateType,
  ModListWithOwnerData,
  UserProfile,
} from '~/types/moddermore';
import { getUserProfile } from './users';

export const getUserLists = async (userId: string): Promise<ModList[]> => {
  const collection = await getListsCollection();
  const lists = await collection.find({ owner: userId }).toArray();

  return lists.sort((a, b) =>
    new Date(a.created_at) > new Date(b.created_at) ? -1 : 1
  );
};

export const getLegacyUserLists = async (email: string): Promise<ModList[]> => {
  const collection = await getListsCollection();
  const lists = await collection.find({ legacy: email }).toArray();

  return lists.sort((a, b) =>
    new Date(a.created_at) > new Date(b.created_at) ? -1 : 1
  );
};

export const getSpecificList = async (
  id: string
): Promise<ModListWithOwnerData | null> => {
  const collection = await getListsCollection();
  let list = await collection.findOne({ customSlug: id });

  let ownerProfile: UserProfile | null = null;

  if (!list) {
    list = await collection.findOne({ id });
    if (list?.customSlug && list?.owner) {
      ownerProfile = await getUserProfile(list.owner);
      if (ownerProfile?.plan === 'pro') return null;
    }
  }

  if (!list) return null;

  if (list.customSlug && list.owner) {
    ownerProfile = await getUserProfile(list.owner);
    if (ownerProfile?.plan !== 'pro') return null;
  }

  if (!ownerProfile && list.owner)
    ownerProfile = await getUserProfile(list.owner);

  return {
    id: list.id,
    title: list.title,
    mods: list.mods,
    gameVersion: list.gameVersion,
    modloader: list.modloader,
    owner: list.owner,
    created_at: list.created_at,
    ownersExtraData: ownerProfile
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
  list: ModListCreateType,
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
  list: ModListUpdateType,
  userId: string
): Promise<boolean> => {
  const collection = await getListsCollection();
  const res = await collection.updateOne({ id, owner: userId }, { $set: list });

  return !!res.modifiedCount;
};
