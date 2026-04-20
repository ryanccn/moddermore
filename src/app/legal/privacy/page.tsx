import type { Metadata } from "next";
import { readFile } from "node:fs/promises";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

import { GlobalLayout } from "~/components/layout/GlobalLayout";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPolicyPage() {
  const markdown = await readFile("docs/legal/privacy.md", { encoding: "utf8" });

  const html = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown)
    .then((vfile) => vfile.toString());

  return (
    <GlobalLayout title="Privacy Policy" displayTitle={false}>
      <article
        className="prose dark:prose-invert prose-headings:font-display max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </GlobalLayout>
  );
}
