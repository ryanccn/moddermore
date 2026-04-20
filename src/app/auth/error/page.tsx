"use client";

import { AlertTriangleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { GlobalLayout } from "~/components/layout/GlobalLayout";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <GlobalLayout
      title="An error occurred!"
      isAuthPage
      titleIcon={
        <AlertTriangleIcon className="mb-8 block size-12 place-self-center text-red-500 dark:text-red-400" />
      }
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
}
