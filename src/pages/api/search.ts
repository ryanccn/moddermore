import { type NextApiHandler } from 'next';

import { z } from 'zod';
import { getListsCollection } from '~/lib/db/client';

const search = async (query: string) => {
  const collection = await getListsCollection();
  const resp = collection.aggregate([
    {
      $search: {
        index: 'search_index',
        text: {
          query,
          path: ['title', 'description'],
        },
      },
    },
    // {
    //   $match: {
    //     visibility: 'public',
    //   },
    // },
  ]);

  return resp.toArray();
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
