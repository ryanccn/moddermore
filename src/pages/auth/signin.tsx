import { type NextPage } from 'next';

import { useRouter } from 'next/router';
import { type FormEventHandler, useState, useEffect } from 'react';

import { signIn, useSession } from 'next-auth/react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { GitHubIcon } from '~/components/icons';
import toast from 'react-hot-toast';

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
      router.push('/dashboard');
      toast.success('Signed in!');
    }
  }, [sess, router]);

  const signin: FormEventHandler = async (e) => {
    e.preventDefault();
    setDS(true);

    await signIn('email', { email });
  };

  return (
    <GlobalLayout title="Sign in" isAuthPage>
      <div className="flex w-full flex-col gap-y-8">
        {router.query.error && (
          <p className="rounded bg-red-500 px-4 py-3 font-semibold text-white">
            {typeof router.query.error === 'string' &&
            router.query.error in errors
              ? // @ts-expect-error it's a key alright
                errors[router.query.error]
              : router.query.error}
          </p>
        )}
        <button
          className="primaryish-button bg-black text-white"
          onClick={async () => {
            setDS(true);
            await signIn('github');
          }}
        >
          <GitHubIcon className="block h-5 w-5 fill-current stroke-transparent" />
          <span>Sign in with GitHub</span>
        </button>

        <form className="flex items-center gap-x-2" onSubmit={signin}>
          <input
            type="text"
            id="email"
            name="email"
            aria-label="Email"
            className="moddermore-input"
            placeholder="hello@moddermore.net"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
          <button
            type="submit"
            className="primaryish-button shrink-0"
            disabled={disableSubmit}
          >
            Sign in with email
          </button>
        </form>
      </div>
    </GlobalLayout>
  );
};

export default SigninPage;
