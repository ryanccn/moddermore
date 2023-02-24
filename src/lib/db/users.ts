import { getProfilesCollection } from './client';
import type { UserEditableProfileData } from '~/types/moddermore';

export const getUserProfile = async (id: string) => {
  const col = await getProfilesCollection();
  let res = await col.findOne({ userId: id });

  if (!res) {
    await col.insertOne({
      userId: id,
      name: null,
      plan: null,
      profilePicture: null,
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
