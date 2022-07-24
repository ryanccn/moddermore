export default function Footer() {
  return (
    <div className="moddermore-footer">
      <a
        href="https://github.com/ryanccn/moddermore"
        target="_blank"
        rel="noopener noreferrer"
      >
        Code open source under AGPLv3 license
      </a>
      <p>
        Revision {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'unknown'}
      </p>
    </div>
  );
}
