import type { Metadata } from "next";
import Link from "next/link";
import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { listChangelogPosts } from "~/lib/changelog";

export const metadata: Metadata = { title: "Changelog" };

export default async function ChangelogIndexPage() {
  const data = await listChangelogPosts();

  return (
    <GlobalLayout title="Changelog">
      <div className="grid grid-cols-1 gap-6">
        {data.map((log) => (
          <Link
            className="flex flex-col gap-y-2 rounded-lg bg-cover p-8 pt-36 text-white"
            style={{
              backgroundImage: log.cover ? `url('${log.cover.src}')` : undefined,
              backgroundPosition: "center",
              backgroundPositionY: log.data["cover-offset"],
            }}
            href={`/changelog/${log.slug}`}
            key={log.slug}
          >
            <h1 className="font-display [text-wrap:_balance;] text-2xl font-bold">{log.data.title}</h1>
            <p className="text-base font-medium">{log.data.date}</p>
          </Link>
        ))}
      </div>
    </GlobalLayout>
  );
}
