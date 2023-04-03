/* eslint-disable unicorn/numeric-separators-style */

export const curseforgeHash = async (data: Uint8Array): Promise<number> => {
  const treatedData = data.filter(
    (v) => v !== 9 && v !== 10 && v !== 13 && v !== 32
  );

  let len = treatedData.length;

  let hash = 1 ^ len;
  let i = 0;

  while (len >= 4) {
    let tmp =
      (treatedData[i] & 0xff) |
      ((treatedData[++i] & 0xff) << 8) |
      ((treatedData[++i] & 0xff) << 16) |
      ((treatedData[++i] & 0xff) << 24);

    tmp =
      (tmp & 0xffff) * 0x5bd1e995 +
      ((((tmp >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    tmp ^= tmp >>> 24;
    tmp =
      (tmp & 0xffff) * 0x5bd1e995 +
      ((((tmp >>> 16) * 0x5bd1e995) & 0xffff) << 16);

    hash =
      ((hash & 0xffff) * 0x5bd1e995 +
        ((((hash >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      tmp;

    len -= 4;
    i += 1;
  }

  switch (len) {
    case 1: {
      hash ^= treatedData[i] & 0xff;
      hash =
        (hash & 0xffff) * 0x5bd1e995 +
        ((((hash >>> 16) * 0x5bd1e995) & 0xffff) << 16);

      break;
    }
    case 2: {
      hash ^= (treatedData[i + 1] & 0xff) << 8;

      break;
    }
    case 3: {
      hash ^= (treatedData[i + 2] & 0xff) << 16;

      break;
    }
  }

  hash ^= hash >>> 13;
  hash =
    (hash & 0xffff) * 0x5bd1e995 +
    ((((hash >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  hash ^= hash >>> 15;

  return hash >>> 0;
};

export const modrinthHash = async (f: Uint8Array): Promise<string> => {
  const ha = await window.crypto.subtle.digest('SHA-512', f);
  const he = [...new Uint8Array(ha)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  return he;
};
