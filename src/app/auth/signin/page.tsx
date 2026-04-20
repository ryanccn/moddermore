"use client";

import { type SubmitEventHandler, useCallback, useEffect, useState } from "react";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { DiscordIcon, GitHubIcon, GoogleIcon } from "~/components/icons";
import { GlobalLayout } from "~/components/layout/GlobalLayout";

import { Button } from "~/components/shadcn/button";
import { Input } from "~/components/shadcn/input";

const errors = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  default: "Unable to sign in.",
};

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [disableSubmit, setDS] = useState(false);

  const sess = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;
  const error = searchParams.get("error");

  useEffect(() => {
    if (sess.status === "authenticated") {
      router.push("/lists");
      toast.success("Signed in!");
    }
  }, [sess, router]);

  const signin: SubmitEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      setDS(true);

      signIn("email", { email, callbackUrl }).catch((error_) => {
        console.error(error_);
        setDS(false);
      });
    },
    [email, callbackUrl],
  );

  return (
    <GlobalLayout title="Sign in" isAuthPage>
      <div className="flex w-full flex-col gap-y-4">
        {error && (
          <p className="mb-8 rounded bg-red-500 px-4 py-3 font-semibold text-white">
            {error in errors ? errors[error as keyof typeof errors] : error}
          </p>
        )}

        <Button
          className="bg-black text-white hover:bg-black"
          size="lg"
          disabled={disableSubmit}
          onClick={() => {
            setDS(true);
            signIn("github", { callbackUrl }).catch((error_) => {
              console.error(error_);
              setDS(false);
            });
          }}
        >
          <GitHubIcon className="block h-5 w-5 fill-current stroke-transparent" />
          <span>Sign in with GitHub</span>
        </Button>
        <Button
          className="bg-[#5865F2] text-white hover:bg-[#5865F2]"
          size="lg"
          disabled={disableSubmit}
          onClick={() => {
            setDS(true);
            signIn("discord", { callbackUrl }).catch((error_) => {
              console.error(error_);
              setDS(false);
            });
          }}
        >
          <DiscordIcon className="block h-5 w-5 fill-current stroke-transparent" />
          <span>Sign in with Discord</span>
        </Button>
        <Button
          className="mb-8 bg-[#4285F4] text-white hover:bg-[#4285F4]"
          size="lg"
          disabled={disableSubmit}
          onClick={() => {
            setDS(true);
            signIn("google", { callbackUrl }).catch((error_) => {
              console.error(error_);
              setDS(false);
            });
          }}
        >
          <GoogleIcon className="block h-5 w-5 fill-current stroke-transparent" />
          <span>Sign in with Google</span>
        </Button>

        <form className="flex items-center gap-x-2" onSubmit={signin}>
          <Input
            type="email"
            id="email"
            name="email"
            aria-label="Email"
            placeholder="hello@moddermore.net"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />

          <Button type="submit" className="shrink-0" disabled={disableSubmit}>
            Sign in with email
          </Button>
        </form>
      </div>
    </GlobalLayout>
  );
}
