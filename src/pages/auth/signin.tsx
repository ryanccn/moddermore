import { type NextPage } from 'next';

import { useRouter } from 'next/router';
import { type FormEventHandler, useState, useEffect, useCallback } from 'react';

import toast from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { DiscordIcon, GitHubIcon, GoogleIcon } from '~/components/icons';
import { Button } from '~/components/ui/Button';

const errors = {
  Signin: 'Try signing in with a different account.',
  OAuthSignin: 'Try signing in with a different account.',
  OAuthCallback: 'Try signing in with a different account.',
  OAuthCreateAccount: 'Try signing in with a different account.',
  EmailCreateAccount: 'Try signing in with a different account.',
  Callback: 'Try signing in with a different account.',
  OAuthAccountNotLinked:
    'To confirm your identity, sign in with the same account you used originally.',
  EmailSignin: 'The e-mail could not be sent.',
  CredentialsSignin:
    'Sign in failed. Check the details you provided are correct.',
  SessionRequired: 'Please sign in to access this page.',
  default: 'Unable to sign in.',
};

const SigninPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [disableSubmit, setDS] = useState(false);

  const sess = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sess.status === 'authenticated') {
      router.push('/lists');
      toast.success('Signed in!');
    }
  }, [sess, router]);

  const signin: FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      setDS(true);

      await signIn('email', {
        email,
        callbackUrl:
          typeof router.query.callbackUrl === 'string'
            ? router.query.callbackUrl
            : undefined,
      });
    },
    [email, router.query.callbackUrl],
  );

  return (
    <GlobalLayout title="Sign in" isAuthPage>
      <div className="flex w-full flex-col gap-y-4">
        {router.query.error && (
          <p className="rounded bg-red-500 px-4 py-3 font-semibold text-white">
            {typeof router.query.error === 'string' &&
            router.query.error in errors
              ? // @ts-expect-error it's a key alright
                errors[router.query.error]
              : router.query.error}
          </p>
        )}
        <Button
          className="bg-black hover:bg-black text-white"
          disabled={disableSubmit}
          onClick={async () => {
            setDS(true);
            await signIn('github', {
              callbackUrl:
                typeof router.query.callbackUrl === 'string'
                  ? router.query.callbackUrl
                  : undefined,
            });
          }}
        >
          <GitHubIcon className="block h-5 w-5 fill-current stroke-transparent" />
          <span>Sign in with GitHub</span>
        </Button>
        <Button
          className="bg-[#5865F2] hover:bg-[#5865F2] text-white"
          disabled={disableSubmit}
          onClick={async () => {
            setDS(true);
            await signIn('discord', {
              callbackUrl:
                typeof router.query.callbackUrl === 'string'
                  ? router.query.callbackUrl
                  : undefined,
            });
          }}
        >
          <DiscordIcon className="block h-5 w-5 fill-current stroke-transparent" />
          <span>Sign in with Discord</span>
        </Button>
        <Button
          className="mb-4 bg-[#4285F4] hover:bg-[#4285F4] text-white"
          disabled={disableSubmit}
          onClick={async () => {
            setDS(true);
            await signIn('google', {
              callbackUrl:
                typeof router.query.callbackUrl === 'string'
                  ? router.query.callbackUrl
                  : undefined,
            });
          }}
        >
          <GoogleIcon className="block h-5 w-5 fill-current stroke-transparent" />
          <span>Sign in with Google</span>
        </Button>

        <form className="flex items-center gap-x-2" onSubmit={signin}>
          <input
            type="text"
            id="email"
            name="email"
            aria-label="Email"
            className="mm-input"
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
};

export default SigninPage;
