import { GetStaticPaths, GetStaticProps, type NextPage } from 'next';

import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import Image from 'next/image';
import { GlobalLayout } from '~/components/layout/GlobalLayout';

import { getBlogPost, listBlogPosts } from '~/lib/blog';

interface PageProps {
  data: {
    title: string;
    cover: {
      src: string;
      width: number | undefined;
      height: number | undefined;
    } | null;
    date: string;
  };
  mdx: MDXRemoteSerializeResult;
}

const BlogPostPage: NextPage<PageProps> = ({ mdx, data }) => {
  return (
    <GlobalLayout title={`${data.title} / Blog`} displayTitle={false}>
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <div className="group relative">
          {data.cover && (
            <Image
              {...data.cover}
              alt=""
              className="not-prose -mt-12 aspect-[2/1] h-auto w-full rounded-2xl object-cover transition-all group-hover:brightness-[.85]"
              priority
            />
          )}

          <div className="not-prose absolute bottom-0 left-0 m-8 flex flex-col gap-y-3 text-black dark:text-white">
            <h1 className="text-4xl font-bold">{data.title}</h1>
            <p className="text-lg font-medium">{data.date}</p>
          </div>
        </div>
        <MDXRemote {...mdx} />
      </article>
    </GlobalLayout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') throw new Error('oof');

  const data = await getBlogPost(slug);

  if (!data) return { notFound: true };

  return {
    props: { ...data },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await listBlogPosts();

  return {
    paths: posts.map((k) => ({ params: { slug: k.slug } })),
    fallback: false,
  };
};

export default BlogPostPage;