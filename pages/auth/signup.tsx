import { supabaseClient } from '@supabase/auth-helpers-nextjs';

import { type NextPage } from 'next';
import { useRouter } from 'next/router';
import { type FormEventHandler, useState } from 'react';
import GlobalLayout from '~/components/GlobalLayout';
import { addUsername, checkUsername } from '~/lib/supabase';

const SignupPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [disableSubmit, setDS] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const signup: FormEventHandler = async (e) => {
    e.preventDefault();
    setDS(true);

    if (!(await checkUsername(username))) {
      setDS(false);
      setError('Username taken!');
      return;
    }

    const { user, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (!user || error) {
      setError(error?.message ?? 'Unknown error occurred');
      return;
    }

    await addUsername(user, username);
    router.push('/dashboard');

    setDS(false);
  };

  return (
    <GlobalLayout title="Sign up">
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
        {error && <p className="mt-6 font-bold text-red-500">{error}</p>}
      </form>
    </GlobalLayout>
  );
};

export default SignupPage;
