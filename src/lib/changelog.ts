import dorian from "gray-matter";
import { imageSize } from "image-size";
import { serialize } from "next-mdx-remote/serialize";

import { format } from "date-fns";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import pLimit from "p-limit";

const logDataFormat = (d: Date) => format(d, "yyyy-MM-dd");

const getPostCover = async (slug: string) => {
  const path = (await exists(join("./public/changelog/covers", `${slug}.jpg`)))
    ? `changelog/covers/${slug}.jpg`
    : (await exists(join("./public/changelog/covers", `${slug}.png`)))
      ? `changelog/covers/${slug}.png`
      : null;

  if (!path) return null;

  const data = await readFile(join("./public", path));
  const { width, height } = imageSize(data);
  return { src: "/" + path, width, height };
};

const exists = async (f: string) => {
  try {
    await stat(f);
  } catch {
    return false;
  }

  return true;
};

export const listChangelogPosts = async () => {
  const fileList = await readdir("docs/changelog").then((list) => list.filter((k) => k.endsWith(".mdx")));
  const lim = pLimit(12);

  const unsorted = await Promise.all(
    fileList.map((fileName) =>
      lim(async () => {
        const { data } = dorian(await readFile(join("docs/changelog", fileName), { encoding: "utf8" }));

        return {
          slug: fileName.replace(".mdx", ""),
          data: {
            ...(data as { title: string; "cover-offset"?: number }),
            date: logDataFormat(data.date as Date),
          },
          cover: await getPostCover(fileName.replace(".mdx", "")),
        };
      }),
    ),
  );

  return unsorted.toSorted((a, b) => (new Date(a.data.date) > new Date(b.data.date) ? -1 : 1));
};

export const getChangelogPost = async (slug: string) => {
  const srcPath = join("./changelog", `${slug}.mdx`);
  if (!(await exists(srcPath))) return null;

  const rawMarkdown = await readFile(srcPath, {
    encoding: "utf8",
  });

  const { data, content } = dorian(rawMarkdown);
  const mdx = await serialize(content);

  const cover = await getPostCover(slug);

  return {
    data: {
      ...(data as { title: string }),
      cover,
      date: logDataFormat(data.date as Date),
    },
    mdx,
  };
};
