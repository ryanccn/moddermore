import type { NextPage } from 'next';

import GlobalLayout from '~/components/GlobalLayout';

const Dashboard: NextPage = () => {
  return (
    <GlobalLayout title="Verification email sent">
      <p>
        Please check your inbox for a verification email. Click the link to
        proceed with registration.
      </p>
    </GlobalLayout>
  );
};

export default Dashboard;
