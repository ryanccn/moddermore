import type { NextApiHandler } from 'next';

import { z } from 'zod';
import { createList } from '~/lib/supabase';

const modZod = z.object({
  provider: z.union([
    z.literal('modrinth'),
    z.literal('curseforge'),
    z.literal('github'),
  ]),

  id: z.string().min(1, 'Fill in the mod ID!'),
});

const modListPartialZod = z.object({
  title: z.string().min(1, 'Fill in a title!'),
  gameVersion: z.string().min(2, 'Fill in a valid game version!'),
  modloader: z.union([
    z.literal('quilt'),
    z.literal('fabric'),
    z.literal('forge'),
  ]),
  mods: z.array(modZod),
});

const h: NextApiHandler = async (req, res) => {
  if (req.method?.toLowerCase() !== 'post') {
    res.status(400).json({ error: 'Not a good method.' });
    return;
  }

  const reqDataParse = modListPartialZod.safeParse(req.body);

  if (!reqDataParse.success) {
    res.status(400).json({
      error: 'Bad request!',
      more: reqDataParse.error.formErrors.fieldErrors,
    });
    return;
  }

  const reqData = reqDataParse.data;

  const id = await createList(reqData);

  res.status(200).json({ id });
};

export default h;
