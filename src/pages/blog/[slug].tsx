import { GetStaticPaths, GetStaticProps, type NextPage } from 'next';

import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
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
        <div
          className="not-prose mb-12 flex flex-col gap-y-3 rounded-2xl bg-cover p-8 pt-40 text-white"
          style={{
            backgroundImage: data.cover
              ? `url('${data.cover.src}')`
              : undefined,
          }}
        >
          <h1 className="text-4xl font-bold">{data.title}</h1>
          <p className="text-lg font-medium">{data.date}</p>
        </div>
        <MDXRemote {...mdx} components={{}} />
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
