import { type NextPage } from 'next';

import { useRouter } from 'next/router';
import { type FormEventHandler, useState, useEffect } from 'react';

import { signIn, useSession } from 'next-auth/react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import toast from 'react-hot-toast';

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
      <form className="flex w-full flex-col items-center" onSubmit={signin}>
        <div className="mb-8 flex w-full items-center space-x-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            className="moddermore-input"
            placeholder="hello@moddermore.app"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
        </div>
        <button
          type="submit"
          className="primaryish-button"
          disabled={disableSubmit}
        >
          Sign in
        </button>
      </form>
    </GlobalLayout>
  );
};

export default SigninPage;
