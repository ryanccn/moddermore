import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { getSpecificList } from "~/lib/db";
import { ListPageClient } from "./_client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getSpecificList(id);
  if (!data) return {};

  return {
    title: data.title,
    robots: data.visibility === "public" ? undefined : { index: false },
  };
}

export default async function ListPage({ params }: PageProps) {
  const { id } = await params;
  const [data, sess] = await Promise.all([getSpecificList(id), getServerSession(authOptions)]);

  if (!data || (data.ownerProfile.banned && !sess?.extraProfile.isAdmin)) {
    notFound();
  }

  if (data.visibility === "private" && sess?.user.id !== data.owner && !sess?.extraProfile.isAdmin) {
    notFound();
  }

  return <ListPageClient data={data} />;
}
