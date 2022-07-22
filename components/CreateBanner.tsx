import Link from 'next/link';

export default function CreateBanner() {
  return (
    <div className="fixed bottom-0 mx-auto mb-4 flex w-full max-w-[75ch] items-center justify-between bg-zinc-50/80 p-4 px-6 backdrop-blur-md dark:bg-zinc-800/80">
      <span>Want your own list just like this?</span>
      <Link href="/new">
        <a className="primaryish-button">Create your own</a>
      </Link>
    </div>
  );
}
