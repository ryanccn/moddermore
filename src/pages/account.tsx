import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

import { useSession, signOut } from 'next-auth/react';

import { FullLoadingScreen } from '~/components/FullLoadingScreen';
import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { toast } from 'react-hot-toast';

const AccountPage: NextPage = () => {
  const session = useSession({ required: true });

  const [name, setName] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [inProgress, setInProgress] = useState(true);

  useEffect(() => {
    if (!session.data) return;

    setName(session.data.extraProfile.name);
    setProfilePicture(session.data.extraProfile.profilePicture);

    setInProgress(false);
  }, [session.data]);

  if (session.status === 'loading') {
    return <FullLoadingScreen />;
  }

  const saveProfile = () => {
    setInProgress(true);
    fetch('/api/profile/update', {
      method: 'POST',
      body: JSON.stringify({
        name: name || null,
        profilePicture: profilePicture || null,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => {
      if (res.ok) {
        toast.success('Profile details saved!');
      } else {
        toast.error('Profile details could not be saved :(');
      }
      setInProgress(false);
    });
  };

  return (
    <GlobalLayout title="Account" displayTitle="Manage your account">
      <form
        className="mb-16 flex flex-col gap-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveProfile();
        }}
      >
        <label className="flex flex-col gap-y-2">
          <span className="text-sm font-semibold">Name</span>
          <input
            className="moddermore-input"
            type="text"
            value={name || ''}
            onChange={(e) => {
              setName(e.target.value);
            }}
            disabled={inProgress}
          />
        </label>
        <label className="flex flex-col gap-y-2">
          <span className="text-sm font-semibold">Profile picture</span>
          <input
            className="moddermore-input"
            type="text"
            value={profilePicture || ''}
            onChange={(e) => {
              setProfilePicture(e.target.value);
            }}
            disabled={inProgress}
          />
        </label>

        <button
          type="submit"
          className="primaryish-button mt-2 self-start"
          disabled={inProgress}
        >
          Save
        </button>
      </form>

      <button
        className="primaryish-button  self-start bg-red-500 px-4 py-2 text-lg font-semibold text-white hover:bg-red-400 hover:brightness-100 focus:ring-red-400/50"
        onClick={() => {
          signOut();
        }}
      >
        Sign out
      </button>
    </GlobalLayout>
  );
};

export default AccountPage;
