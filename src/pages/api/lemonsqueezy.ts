import type { NextApiHandler } from 'next';

import { getProfilesCollection, getUsersCollection } from '~/lib/db/client';
import { parseLSRequest } from '~/lib/lemonSqueezy';

const h: NextApiHandler = async (req, res) => {
  const lemonSqueezyData = await parseLSRequest(req);
  if (!lemonSqueezyData) {
    res.status(401).end();
    return;
  }

  const usersCollection = await getUsersCollection();
  const profilesCollection = await getProfilesCollection();
  if (lemonSqueezyData.event === 'subscription_created') {
    const email = lemonSqueezyData.data.attributes.user_email;
    const user = await usersCollection.findOne({ email });

    if (!user) {
      res.status(500).end();
      return;
    }

    await profilesCollection.updateOne(
      { userId: user._id.toString() },
      { $set: { plan: 'pro' } }
    );

    res.status(201).end();
    return;
  } else if (lemonSqueezyData.event === 'subscription_expired') {
    const email = lemonSqueezyData.data.attributes.user_email;
    const user = await usersCollection.findOne({ email });

    if (!user) {
      res.status(500).end();
      return;
    }

    await profilesCollection.updateOne(
      { userId: user._id.toString() },
      { $set: { plan: null } }
    );

    res.status(201).end();
    return;
  }
};

export default h;

export const config = {
  api: {
    bodyParser: false,
  },
};
