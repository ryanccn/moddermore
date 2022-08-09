import { type NextPage } from 'next';

import { type FormEventHandler, useState } from 'react';
import { useRouter } from 'next/router';

import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { checkUsername } from '~/lib/supabase';

import Link from 'next/link';
import { GlobalLayout } from '~/components/layout/GlobalLayout';
import toast from 'react-hot-toast';

const SignupPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [disableSubmit, setDS] = useState(false);

  const router = useRouter();

  const signup: FormEventHandler = async (e) => {
    e.preventDefault();
    setDS(true);

    if (username.includes(' ')) {
      setDS(false);
      toast.error('Username can not contain spaces!');
      return;
    }

    if (!(await checkUsername(supabaseClient, username))) {
      setDS(false);
      toast.error('Username taken!');
      return;
    }

    const { user, error } = await supabaseClient.auth.signUp(
      {
        email,
        password,
      },
      { data: { username } }
    );

    if (!user || error) {
      toast.error(error?.message ?? 'Unknown error occurred');
      return;
    }

    toast.success('Check your inbox for a verification email!');
    router.push('/auth/signin');
    setDS(false);
  };

  return (
    <GlobalLayout title="Sign up">
      <p className="mb-6">
        or{' '}
        <Link href="/auth/signin">
          <a className="text-indigo-500 transition-all hover:brightness-90 dark:text-indigo-400">
            sign in
          </a>
        </Link>
      </p>

      <form className="flex flex-col items-center" onSubmit={signup}>
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
          <label htmlFor="username" className="mb-2 text-sm font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="moddermore-input mb-4"
            placeholder="iammoddermore"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
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
          Sign up
        </button>
      </form>
    </GlobalLayout>
  );
};

export default SignupPage;
