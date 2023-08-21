import { InboxIcon } from "lucide-react";
import { type NextPage } from "next";

import { GlobalLayout } from "~/components/layout/GlobalLayout";

const SigninPage: NextPage = () => {
  return (
    <GlobalLayout
      title="Check your inbox"
      isAuthPage
      titleIcon={<InboxIcon className="mb-2 block h-12 w-12 animate-bounce" />}
    >
      <p className="text-lg">
        Check your email inbox for a magical login link! ✨
      </p>
    </GlobalLayout>
  );
};

export default SigninPage;
