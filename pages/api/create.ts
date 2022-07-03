import type { NextApiHandler } from 'next';

import { z } from 'zod';
import { createList } from '~/lib/supabase';

const modZod = z.object({
  provider: z.union([
    z.literal('modrinth'),
    z.literal('curseforge'),
    z.literal('github'),
  ]),

  id: z.string(),
});

const modListPartialZod = z.object({
  title: z.string(),
  mods: z.array(modZod),
});

const h: NextApiHandler = async (req, res) => {
  const reqDataParse = modListPartialZod.safeParse(req.body);

  if (!reqDataParse.success) {
    res.status(400).json({ error: 'Bad request!' });
    return;
  }

  const reqData = reqDataParse.data;

  const id = await createList(reqData);

  res.status(200).json({ id });
};

export default h;
