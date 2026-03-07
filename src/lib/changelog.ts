import dorian from "gray-matter";
import { imageSize } from "image-size";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

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
  const fileList = await readdir("docs/changelog").then((list) => list.filter((k) => k.endsWith(".md")));
  const lim = pLimit(12);

  const unsorted = await Promise.all(
    fileList.map((fileName) =>
      lim(async () => {
        const { data } = dorian(await readFile(join("docs/changelog", fileName), { encoding: "utf8" }));

        return {
          slug: fileName.replace(".md", ""),
          data: {
            ...(data as { title: string; "cover-offset"?: number }),
            date: logDataFormat(data.date as Date),
          },
          cover: await getPostCover(fileName.replace(".md", "")),
        };
      }),
    ),
  );

  return unsorted.toSorted((a, b) => (new Date(a.data.date) > new Date(b.data.date) ? -1 : 1));
};

export const getChangelogPost = async (slug: string) => {
  const srcPath = join("./docs/changelog", `${slug}.md`);
  if (!(await exists(srcPath))) return null;

  const rawMarkdown = await readFile(srcPath, {
    encoding: "utf8",
  });

  const { data, content } = dorian(rawMarkdown);
  const html = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(content)
    .then((vfile) => vfile.toString());

  const cover = await getPostCover(slug);

  return {
    data: {
      ...(data as { title: string }),
      cover,
      date: logDataFormat(data.date as Date),
    },
    html,
  };
};
