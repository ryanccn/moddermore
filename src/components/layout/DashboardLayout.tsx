import { type ReactNode } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { GlobalLayout } from './GlobalLayout';
import { HeartIcon, ListBulletIcon, UserIcon } from '@heroicons/react/24/solid';

interface Props {
  title: string;
  children: ReactNode;
}

const DashboardLink = ({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon: ReactNode;
}) => {
  const router = useRouter();

  return (
    <Link
      href={href}
      className={
        router.pathname.startsWith(href)
          ? 'primaryish-button'
          : 'primaryish-button secondaryish-instead'
      }
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

export const DashboardLayout = ({ title, children }: Props) => {
  return (
    <GlobalLayout title={title} displayTitle={false} isLandingPage>
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <div className="flex flex-col gap-y-2 border-r-2 border-neutral-200 p-4 dark:border-neutral-700 lg:min-h-screen lg:w-1/4 lg:grow-0">
          <DashboardLink
            title="Lists"
            href="/lists"
            icon={<ListBulletIcon className="block h-5 w-5" />}
          />
          <DashboardLink
            title="Likes"
            href="/likes"
            icon={<HeartIcon className="block h-5 w-5" />}
          />
          <DashboardLink
            title="Account"
            href="/account"
            icon={<UserIcon className="block h-5 w-5" />}
          />
        </div>
        {children}
      </div>
    </GlobalLayout>
  );
};
