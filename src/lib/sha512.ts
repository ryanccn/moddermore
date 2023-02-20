import { createHash } from 'node:crypto';

export const sha512 = async (f: string): Promise<string> => {
  const hash = createHash('sha-512');
  hash.update(f);
  return hash.digest().toString('hex');
};
