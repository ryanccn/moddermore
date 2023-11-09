import type { GetStaticProps, NextPage } from "next";
import { readFile } from "node:fs/promises";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

import { GlobalLayout } from "~/components/layout/GlobalLayout";

interface PageProps {
  content: string;
}

const PrivacyPolicy: NextPage<PageProps> = ({ content }) => {
  return (
    <GlobalLayout title="Privacy Policy" displayTitle={false}>
      <article
        className="prose max-w-none dark:prose-invert prose-headings:font-display"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </GlobalLayout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const markdown = await readFile("./legal/privacy.md", { encoding: "utf8" });

  const html = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown)
    .then((vfile) => vfile.toString());

  return { props: { content: html } };
};

export default PrivacyPolicy;
