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
      <a
        href="https://discord.gg/uf6kxSawfc"
        className="!text-indigo-500 hover:!brightness-125 dark:!text-indigo-400"
        rel="noreferrer"
      >
        Join the Discord
      </a>
      {typeof process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== 'undefined' && (
        <a
          href={`https://github.com/ryanccn/moddermore/commit/${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Revision{' '}
          {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.substring(0, 8)}
        </a>
      )}
      <PoweredByVercel />
    </footer>
  );
};
