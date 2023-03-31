import { GetStaticProps, type NextPage } from 'next';

import Image from 'next/image';
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        {data.map((post) => (
          <Link
            className="group relative overflow-hidden rounded-2xl"
            href={`/blog/${post.slug}`}
            key={post.slug}
          >
            {post.cover && (
              <Image
                {...post.cover}
                alt=""
                className="aspect-[2/1] h-auto w-full object-cover transition-all group-hover:brightness-[.85]"
                priority
              />
            )}

            <div className="absolute bottom-0 left-0 m-8 flex flex-col gap-y-3 text-white">
              <h1 className="text-2xl font-bold">{post.data.title}</h1>
              <p className="text-base font-medium">{post.data.date}</p>
            </div>
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
