import type { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';

import { useSession, signOut } from 'next-auth/react';

import { FullLoadingScreen } from '~/components/FullLoadingScreen';
import { DashboardLayout } from '~/components/layout/DashboardLayout';

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

  const saveProfile = useCallback(() => {
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
  }, [name, profilePicture]);

  if (session.status === 'loading') {
    return <FullLoadingScreen />;
  }

  return (
    <DashboardLayout title="Account">
      <div className="flex w-full flex-col px-6">
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
              className="moddermore-input max-w-prose"
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
              className="moddermore-input max-w-prose"
              type="url"
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
          className="primaryish-button oh-no self-start px-4 py-2 text-lg font-semibold"
          onClick={() => {
            signOut();
          }}
        >
          Sign out
        </button>
      </div>
    </DashboardLayout>
  );
};

export default AccountPage;
