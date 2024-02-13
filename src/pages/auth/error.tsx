import { AlertTriangleIcon } from "lucide-react";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import { GlobalLayout } from "~/components/layout/GlobalLayout";

const SigninPage: NextPage = () => {
  const {
    query: { error },
  } = useRouter();

  return (
    <GlobalLayout
      title="An error occurred!"
      isAuthPage
      titleIcon={<AlertTriangleIcon className="mb-2 block h-12 w-12 text-red-400" />}
    >
      <p className="text-lg">
        {error === "Configuration"
          ? "There is a problem with the server configuration."
          : error === "AccessDenied"
            ? "Access denied."
            : error === "Verification"
              ? "The token has expired or has already been used."
              : "Unknown error! Please open an issue on GitHub."}
      </p>
    </GlobalLayout>
  );
};

export default SigninPage;
