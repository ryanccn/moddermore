import Link from 'next/link';
import { PoweredByVercel } from '../PoweredByVercel';

export const Footer = () => {
  return (
    <footer className="moddermore-footer">
      <a
        href="https://github.com/ryanccn/moddermore"
        target="_blank"
        rel="noreferrer"
      >
        Code open source under AGPLv3 license
      </a>
      <Link href="/legal/privacy">Privacy Policy</Link>
      <a
        href="https://discord.gg/uf6kxSawfc"
        className="!text-indigo-500 hover:!brightness-125 dark:!text-indigo-400"
        rel="noreferrer"
      >
        Join the Discord
      </a>
      <PoweredByVercel />
    </footer>
  );
};
