import { createHash } from "node:crypto";

export const sha512 = (f: string): string => {
  const hash = createHash("sha-512");
  hash.update(f);
  return hash.digest().toString("hex");
};
