/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable unicorn/no-process-exit */

import { getListsCollection } from "~/lib/db/client";
import type { Mod } from "~/types/moddermore";

(async () => {
  const lists = await getListsCollection();
  const result = await lists.updateMany({ mods: null as unknown as Mod[] }, { $set: { mods: [] } });
  console.log(result.modifiedCount);
})()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
