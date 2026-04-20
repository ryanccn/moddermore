import type { Metadata } from "next";
import { InboxIcon } from "lucide-react";
import { GlobalLayout } from "~/components/layout/GlobalLayout";

export const metadata: Metadata = { title: "Check your inbox", robots: { index: false } };

export default function VerifyPage() {
  return (
    <GlobalLayout
      title="Check your inbox"
      isAuthPage
      titleIcon={<InboxIcon className="mb-8 block size-12 place-self-center" />}
    >
      <p className="text-lg">Check your email inbox for a magical login link! ✨</p>
    </GlobalLayout>
  );
}
