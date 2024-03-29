/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable unicorn/no-process-exit */

import { blue, red } from "kleur/colors";
import { getProfilesCollection, getUsersCollection } from "~/lib/db/client";

(async () => {
  const profileCollection = await getProfilesCollection();
  const usersCollection = await getUsersCollection();

  const deleteRes = await profileCollection.deleteMany({});
  console.log(red(`Deleted ${deleteRes.deletedCount} profiles`));

  const userCursor = usersCollection.find();
  let user = await userCursor.next();

  while (user !== null) {
    if (await profileCollection.findOne({ email: user.email })) {
      console.log("Skipped", blue(user.email));
    } else {
      await profileCollection.insertOne({
        userId: user._id.toString(),
        name: null,
        profilePicture: null,
        likes: [],
      });
      console.log("Built profile for", blue(user.email));
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
