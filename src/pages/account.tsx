import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

import { signOut, useSession } from "next-auth/react";

import { FullLoadingScreen } from "~/components/FullLoadingScreen";
import { DashboardLayout } from "~/components/layout/DashboardLayout";

import { Button } from "~/components/shadcn/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/shadcn/field";
import { Input } from "~/components/shadcn/input";
import { Spinner } from "~/components/shadcn/spinner";

import { LogOutIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

const AccountPage: NextPage = () => {
  const session = useSession({ required: true });

  const [name, setName] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [status, setStatus] = useState<"initial" | "ready" | "working">("initial");

  useEffect(() => {
    if (status !== "initial" || !session.data) return;

    setName(session.data.extraProfile.name);
    setProfilePicture(session.data.extraProfile.profilePicture);
    void session.update();

    setStatus("ready");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data]);

  const saveProfile = useCallback(() => {
    setStatus("working");

    fetch("/api/profile/update", {
      method: "POST",
      body: JSON.stringify({
        name: name || null,
        profilePicture: profilePicture || null,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Profile details saved!");
        } else {
          toast.error("Profile details could not be saved :(");
        }

        setStatus("ready");
      })
      .catch((error) => {
        console.error(error);
        setStatus("ready");
      });
  }, [name, profilePicture]);

  if (session.status === "loading") {
    return <FullLoadingScreen />;
  }

  return (
    <DashboardLayout title="Account">
      <div className="flex w-full flex-col px-6">
        <form
          className="mb-16 flex flex-col gap-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveProfile();
          }}
        >
          <FieldSet>
            <FieldLegend>Account</FieldLegend>
            <FieldDescription>Manage your account details here.</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  type="text"
                  autoComplete="false"
                  value={name || ""}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  disabled={status !== "ready"}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Profile picture</FieldLabel>
                <Input
                  type="url"
                  autoComplete="false"
                  value={profilePicture || ""}
                  onChange={(e) => {
                    setProfilePicture(e.target.value);
                  }}
                  disabled={status !== "ready"}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <Button type="submit" className="mt-8 self-start" disabled={status !== "ready"}>
            {status === "ready" ? <SaveIcon /> : <Spinner />}
            <span>Save</span>
          </Button>
        </form>

        <Button
          variant="destructive"
          size="lg"
          className="self-start px-4 py-2 text-lg font-semibold"
          onClick={() => {
            signOut({ callbackUrl: "/" }).catch((error) => {
              console.log(error);
            });
          }}
        >
          <LogOutIcon className="block h-5 w-5" />
          <span>Sign out</span>
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AccountPage;
