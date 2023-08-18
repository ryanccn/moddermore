import { serialize } from 'next-mdx-remote/serialize';
import sizeOf from 'image-size';
import dorian from 'gray-matter';

import { format } from 'date-fns';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import pLimit from 'p-limit';

const postDataFormat = (d: Date) => format(d, 'yyyy-MM-dd');

const getPostCover = async (slug: string) => {
  const path = (await exists(join('./public/blog/covers', `${slug}.jpg`)))
    ? `blog/covers/${slug}.jpg`
    : (await exists(join('./public/blog/covers', `${slug}.png`)))
    ? `blog/covers/${slug}.png`
    : null;

  if (!path) return null;

  const { width, height } = sizeOf(join('./public', path));
  return { src: '/' + path, width, height };
};

const exists = async (f: string) => {
  try {
    await stat(f);
  } catch {
    return false;
  }

  return true;
};

export const listBlogPosts = async () => {
  const fileList = await readdir('./blog').then((list) =>
    list.filter((k) => k.endsWith('.mdx')),
  );
  const lim = pLimit(10);

  const unsorted = await Promise.all(
    fileList.map((fileName) =>
      lim(async () => {
        const { data } = dorian(
          await readFile(join('./blog', fileName), { encoding: 'utf8' }),
        );

        return {
          slug: fileName.replace('.mdx', ''),
          data: {
            ...(data as { title: string }),
            date: postDataFormat(data.date),
          },
          cover: await getPostCover(fileName.replace('.mdx', '')),
        };
      }),
    ),
  );

  return unsorted.sort((a, b) =>
    new Date(a.data.date) > new Date(b.data.date) ? -1 : 1,
  );
};

export const getBlogPost = async (slug: string) => {
  const srcPath = join('./blog', `${slug}.mdx`);
  if (!(await exists(srcPath))) return null;

  const rawMarkdown = await readFile(srcPath, {
    encoding: 'utf8',
  });

  const { data, content } = dorian(rawMarkdown);
  const mdx = await serialize(content);

  const cover = await getPostCover(slug);

  return {
    data: {
      ...(data as { title: string }),
      cover,
      date: postDataFormat(data.date),
    },
    mdx,
  };
};
