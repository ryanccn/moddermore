import { getProfilesCollection } from './client';
import type { UserEditableProfileData } from '~/types/moddermore';
import { getSpecificListByID } from '.';

export const getUserProfile = async (id: string) => {
  const col = await getProfilesCollection();
  let res = await col.findOne({ userId: id });

  if (!res) {
    await col.insertOne({
      userId: id,
      name: null,
      plan: null,
      profilePicture: null,
      subscriptionId: null,
    });

    res = await col.findOne({ userId: id });
  }

  return res;
};

export const isPro = async (id: string) => {
  const col = await getProfilesCollection();
  const profile = await col.findOne({ userId: id });

  return profile?.plan === 'pro';
};

export const updateUserProfile = async (
  id: string,
  profile: UserEditableProfileData
) => {
  const col = await getProfilesCollection();

  const res = await col.updateOne({ userId: id }, { $set: profile });

  if (!res.matchedCount) {
    console.warn('User profile update failed because none was found!');
  }
};

export const getLikeStatus = async (userId: string, listId: string) => {
  const col = await getProfilesCollection();
  const res = await col.findOne({ userId });

  return res?.likes ? res.likes.includes(listId) : false;
};

export const like = async (userId: string, listId: string) => {
  if (!(await getSpecificListByID(listId))) return false;

  const col = await getProfilesCollection();
  let res = await col.updateOne({ userId }, { $push: { likes: listId } });

  if (!res.acknowledged) {
    res = await col.updateOne({ userId }, { $set: { likes: [listId] } });
  }

  return res.acknowledged;
};

export const dislike = async (userId: string, listId: string) => {
  if (!(await getSpecificListByID(listId))) return false;

  const col = await getProfilesCollection();
  let res = await col.updateOne({ userId }, { $pull: { likes: listId } });

  if (!res.acknowledged) {
    res = await col.updateOne({ userId }, { $set: { likes: [] } });
  }

  return res.acknowledged;
};
