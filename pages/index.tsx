import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div className="grid min-w-screen min-h-screen place-items-center">
      <div className="flex flex-col items-center text-center space-y-4 max-w-prose">
        <p className="font-semibold text-xl">
          This website is currently in closed beta.
        </p>
        <p className="closed-beta-contact">
          Contact the author of this website at Twitter{' '}
          <a href="https://twitter.com/RyanCaoDev">@RyanCaoDev</a> or Discord
          server{' '}
          <a href="https://discord.gg/hUANJjEfTK">discord.gg/hUANJjEfTK</a> to
          get access.
        </p>
      </div>
    </div>
  );
};

export default Home;
