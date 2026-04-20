import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { getChangelogPost, listChangelogPosts } from "~/lib/changelog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const logs = await listChangelogPosts();
  return logs.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getChangelogPost(slug);
  if (!data) return {};

  const absoluteCoverURL = data.data.cover
    ? new URL(data.data.cover.src, "https://moddermore.net").toString()
    : null;

  return {
    title: `${data.data.title} / Changelog`,
    openGraph: absoluteCoverURL ? { images: absoluteCoverURL } : undefined,
    twitter: absoluteCoverURL ? { images: absoluteCoverURL } : undefined,
  };
}

export default async function ChangelogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getChangelogPost(slug);
  if (!post) notFound();

  const { data, html } = post;

  return (
    <GlobalLayout title={`${data.title} / Changelog`} displayTitle={false}>
      <div
        className="mb-12 flex flex-col gap-y-3 rounded-2xl bg-cover p-8 pt-40 text-white"
        style={{
          backgroundImage: data.cover ? `url('${data.cover.src}')` : undefined,
          backgroundPosition: "center",
        }}
      >
        <h1 className="font-display [text-wrap:_balance;] text-4xl font-bold">{data.title}</h1>
        <p className="text-lg font-medium">{data.date}</p>
      </div>

      <article
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </GlobalLayout>
  );
}
