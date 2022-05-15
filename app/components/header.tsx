import { Link } from "@remix-run/react";

const Header = () => {
  return (
    <header className="px-5 lg:px-10 xl:px-14 my-6 flex gap-3 sm:gap-0 flex-row justify-between">
      <Link to="/">
        <h1 className="text-4xl lg:text-7xl font-bold text-left group">
          Hasan
          <span className="dark:text-black text-white inline-block bg-twitchPurpleLight group-hover:bg-twitchPurple p-2 ml-2 rounded-lg">
            Hub
          </span>
        </h1>
      </Link>

      <div className="flex flex-row space-x-3 items-center">
        <a
          href="https://twitch.tv/chrcit"
          target="_blank"
          rel="noreferrer"
          className="bg-twitchPurpleLight text-white text-center font-bold hover:bg-twitchPurple px-4 py-2 rounded"
        >
          Made by chrcit
        </a>
      </div>
    </header>
  );
};

export default Header;
