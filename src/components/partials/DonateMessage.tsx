export const DonationMessage = () => {
  return (
    <div className="mb-12 flex flex-col gap-y-4 rounded-lg bg-neutral-100 p-6 shadow dark:bg-neutral-800">
      <h2 className="text-lg font-bold">
        Hello! I&apos;m the creator of Moddermore.
      </h2>
      <p>
        This service is completely free for everyone to use, but running the
        services and databases behind them costs money! In addition, I have
        poured a lot of effort and time into making this possible, so please
        consider donating to keep this project sustainable and remain open for
        everyone 😇
      </p>
      <p>
        Donator perks will include{' '}
        <strong>custom slugs for your lists, mod file uploads,</strong> and more
        to come ✨
      </p>
      <a
        href="https://ko-fi.com/ryancaodev"
        className="hover:brigt rounded bg-yellow-500 px-4 py-3 text-center text-lg font-semibold text-white transition hover:brightness-90"
      >
        Donate
      </a>
    </div>
  );
};
