import { ArrowLeftIcon } from '@heroicons/react/outline';
import Link from 'next/link';

interface Props {
  href: string;
}

export default function BackLink({ href }: Props) {
  return (
    <Link href={href}>
      <a className="mb-3 flex items-center space-x-1 text-base font-medium text-indigo-500 transition-all hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-400">
        <ArrowLeftIcon className="block h-4 w-4 stroke-2" />
        <span>Back</span>
      </a>
    </Link>
  );
}
