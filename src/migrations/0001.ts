/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable unicorn/no-process-exit */

import { getProfilesCollection, getUsersCollection } from '~/lib/db/client';
import { blue, red } from 'kleur/colors';

(async () => {
  const profileCollection = await getProfilesCollection();
  const usersCollection = await getUsersCollection();

  const deleteRes = await profileCollection.deleteMany({});
  console.log(red(`Deleted ${deleteRes.deletedCount} profiles`));

  const userCursor = usersCollection.find();
  let user = await userCursor.next();

  while (user !== null) {
    if (!(await profileCollection.findOne({ email: user.email }))) {
      await profileCollection.insertOne({
        userId: user._id.toString(),
        name: null,
        profilePicture: null,
        plan: null,
        subscriptionId: null,
        likes: [],
      });
      console.log('Built profile for', blue(user.email));
    } else {
      console.log('Skipped', blue(user.email));
    }

    user = await userCursor.next();
  }
})()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
