import { supabaseClient } from '@supabase/auth-helpers-nextjs';

import { type NextPage } from 'next';

import { useRouter } from 'next/router';
import { type FormEventHandler, useState } from 'react';

import Link from 'next/link';
import GlobalLayout from '~/components/GlobalLayout';

const SigninPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [disableSubmit, setDS] = useState(false);

  const router = useRouter();

  const signin: FormEventHandler = async (e) => {
    e.preventDefault();
    setDS(true);

    const ret = await supabaseClient.auth.signIn({ email, password });
    if (ret.error) {
      console.error(ret.error);
      return;
    }

    router.push('/dashboard');

    setDS(false);
  };

  return (
    <GlobalLayout title="Sign in">
      <p className="mb-6">
        or{' '}
        <Link href="/auth/signup">
          <a className="text-indigo-500 transition-all hover:brightness-90 dark:text-indigo-400">
            sign up
          </a>
        </Link>
      </p>

      <form className="flex flex-col items-center" onSubmit={signin}>
        <div className="w-full">
          <label htmlFor="email" className="mb-2 text-sm font-medium">
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            className="moddermore-input mb-4"
            placeholder="hello@moddermore.app"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
        </div>
        <div className="w-full">
          <label htmlFor="password" className="mb-2 text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="moddermore-input mb-8"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
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
