import { readFile } from 'node:fs/promises';
import type { GetStaticProps, NextPage } from 'next';

import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { GlobalLayout } from '~/components/layout/GlobalLayout';

interface PageProps {
  content: string;
}

const PrivacyPolicy: NextPage<PageProps> = ({ content }) => {
  return (
    <GlobalLayout title="Privacy Policy" displayTitle={false}>
      <article
        className="prose max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </GlobalLayout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const html = await remark()
    .use(remarkHtml)
    .process(await readFile('./legal/privacy.md', { encoding: 'utf8' }))
    .then((vfile) => vfile.toString());

  return { props: { content: html } };
};

export default PrivacyPolicy;
