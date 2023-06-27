/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable unicorn/no-process-exit */

import { getListsCollection } from '~/lib/db/client';

(async () => {
  const lists = await getListsCollection();
  await lists.updateMany({}, { $set: { description: null } });
})()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
