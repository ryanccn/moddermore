import { GetStaticProps, type NextPage } from 'next';

import Link from 'next/link';
import { GlobalLayout } from '~/components/layout/GlobalLayout';

import { listBlogPosts } from '~/lib/blog';

interface PageProps {
  data: {
    slug: string;
    data: {
      title: string;
      date: string;
    };
    cover: {
      src: string;
      width: number | undefined;
      height: number | undefined;
    } | null;
  }[];
}

const BlogIndexPage: NextPage<PageProps> = ({ data }) => {
  return (
    <GlobalLayout title="Blog">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.map((post) => (
          <Link
            className="flex flex-col gap-y-3 rounded-2xl bg-cover p-8 pt-40 text-white"
            style={{
              backgroundImage: post.cover
                ? `url('${post.cover.src}')`
                : undefined,
              backgroundPosition: 'center',
            }}
            href={`/blog/${post.slug}`}
            key={post.slug}
          >
            <h1 className="text-2xl font-bold">{post.data.title}</h1>
            <p className="text-base font-medium">{post.data.date}</p>
          </Link>
        ))}
      </div>
    </GlobalLayout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  return {
    props: { data: await listBlogPosts() },
  };
};

export default BlogIndexPage;
