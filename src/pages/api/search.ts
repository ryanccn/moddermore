import { type NextApiHandler } from 'next';
import { getServerSession } from 'next-auth';

import pLimit from 'p-limit';
import * as v from 'valibot';
import { authOptions } from '~/lib/authOptions';

import { getSpecificList } from '~/lib/db';
import { getListsCollection } from '~/lib/db/client';
import { type ModList } from '~/types/moddermore';

const lim = pLimit(16);

const search = async (query: string, isAdmin?: boolean) => {
  const collection = await getListsCollection();
  const resp = collection.aggregate<ModList>([
    {
      $search: {
        index: 'search_index',
        text: {
          query,
          path: ['title', 'description'],
        },
      },
    },
    ...(isAdmin
      ? []
      : [
          {
            $match: {
              visibility: 'public',
            },
          },
        ]),
  ]);

  const arr = await resp.toArray();
  return Promise.all(arr.map((k) => lim(() => getSpecificList(k.id)))).then(
    (k) => k.filter(Boolean),
  );
};

const validate = v.object({ query: v.string([v.minLength(1)]) });

const handler: NextApiHandler = async (req, res) => {
  const parsedBody = v.safeParse(validate, req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: 'bad request' });
    return;
  }

  const {
    data: { query },
  } = parsedBody;

  const sess = await getServerSession(req, res, authOptions);

  const searchResults = await search(query, sess?.extraProfile?.isAdmin);
  res.json(searchResults);
};

export default handler;
