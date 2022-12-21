import Link from 'next/link';
import { PoweredByVercel } from '../PoweredByVercel';

export const Footer = () => {
  return (
    <footer className="moddermore-footer">
      <a
        href="https://discord.gg/uf6kxSawfc"
        className="primaryish-button mb-4 !font-semibold !text-white"
        rel="noreferrer"
      >
        Join the Discord
      </a>
      <Link href="/legal/privacy">Privacy Policy</Link>
      <a
        href="https://github.com/ryanccn/moddermore"
        className="!mb-4"
        rel="noreferrer"
      >
        Code open source under AGPLv3
      </a>
      <PoweredByVercel />
    </footer>
  );
};
