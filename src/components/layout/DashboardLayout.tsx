import { type ReactNode } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { GlobalLayout } from './GlobalLayout';
import { buttonVariants } from '../ui/Button';
import { HeartIcon, ListIcon, UserIcon } from 'lucide-react';

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
      className={buttonVariants({
        variant: router.pathname.startsWith(href) ? 'primary' : 'secondary',
      })}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

export const DashboardLayout = ({ title, children }: Props) => {
  return (
    <GlobalLayout title={title} displayTitle={false} wideLayout>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <div className="flex flex-col gap-y-2 md:border-r-2 border-neutral-100 p-4 dark:border-neutral-800 md:min-h-screen md:w-72 md:grow-0 md:shrink-0">
          <DashboardLink
            title="Lists"
            href="/lists"
            icon={<ListIcon className="block w-5 h-5" />}
          />
          <DashboardLink
            title="Likes"
            href="/likes"
            icon={<HeartIcon className="block w-5 h-5" />}
          />
          <DashboardLink
            title="Account"
            href="/account"
            icon={<UserIcon className="block w-5 h-5" />}
          />
        </div>
        <div className="py-8 w-full">{children}</div>
      </div>
    </GlobalLayout>
  );
};
