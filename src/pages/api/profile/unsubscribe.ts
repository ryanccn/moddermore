import { type NextApiHandler } from 'next';

import { getServerSession } from 'next-auth';
import { authOptions } from '~/lib/authOptions';
import { getProfilesCollection } from '~/lib/db/client';

const h: NextApiHandler = async (req, res) => {
  const sess = await getServerSession(req, res, authOptions);
  if (!sess) {
    res.status(401).end();
    return;
  }

  if (sess.extraProfile.plan !== 'plus') {
    res.status(201).end();
    return;
  }

  if (sess.extraProfile.subscriptionId) {
    const lsRes = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${sess.extraProfile.subscriptionId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        },
      }
    );

    if (!lsRes.ok) {
      res.status(500).end();
      console.error(
        `Error updating Lemon Squeezy: ${lsRes.status} ${lsRes.statusText}`
      );
      return;
    }
  }

  const profilesCollection = await getProfilesCollection();
  await profilesCollection.updateOne(
    { userId: sess.user.id },
    { $set: { plan: null, subscriptionId: null } }
  );

  res.status(200).end();
};

export default h;
