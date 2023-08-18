import type { NextApiHandler } from 'next';

import { getSpecificList } from '~/lib/db';
import { getPackTOML } from '~/lib/export/formats/packwiz';

const h: NextApiHandler = async (req, res) => {
  if (typeof req.query.id !== 'string') {
    res.status(400).end();
    return;
  }

  const list = await getSpecificList(req.query.id);

  if (!list || list.visibility === 'private') {
    res.status(404).end();
    return;
  }

  res.setHeader('content-type', 'application/toml; charset=utf-8');
  res.send(await getPackTOML(req.query.id));
};

export default h;
