import { type NextApiHandler } from 'next';

import pLimit from 'p-limit';
import { z } from 'zod';

import { getSpecificList } from '~/lib/db';
import { getListsCollection } from '~/lib/db/client';
import { type ModList } from '~/types/moddermore';

const lim = pLimit(16);

const search = async (query: string) => {
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
    {
      $match: {
        visibility: 'public',
      },
    },
  ]);

  const arr = await resp.toArray();
  return Promise.all(arr.map((k) => lim(() => getSpecificList(k.id)))).then(
    (k) => k.filter(Boolean),
  );
};

const validate = z.object({ query: z.string().min(1) });

const handler: NextApiHandler = async (req, res) => {
  const parsedBody = validate.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: 'bad request' });
    return;
  }

  const {
    data: { query },
  } = parsedBody;

  const searchResults = await search(query);
  res.json(searchResults);
};

export default handler;
