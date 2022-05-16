import { Link } from "@remix-run/react";

const Header = () => {
  return (
    <header className="px-5 lg:px-10 xl:px-14 my-6 flex gap-3 sm:gap-0 flex-col sm:flex-row justify-between">
      <Link to="/" prefetch="render">
        <h1 className="text-4xl lg:text-7xl font-bold sm:text-left group text-center">
          Hasan
          <span className="dark:text-black text-white inline-block bg-twitchPurpleLight group-hover:bg-twitchPurple p-2 ml-2 rounded-lg saturate-50">
            Hub
          </span>
        </h1>
      </Link>

      <div className="flex flex-row gap-2 justify-center sm:justify-end items-center text-sm md:text-base">
        <a
          href="https://twitter.com/chrcit"
          target="_blank"
          rel="noreferrer"
          className="bg-twitchPurpleLight saturate-50 text-white text-center font-bold hover:bg-twitchPurple px-4 py-2 rounded"
        >
          Made by @chrcit
        </a>
        <a
          href="https://buymeacoffee.com/chrcit"
          target="_blank"
          rel="noreferrer"
          className="bg-twitchPurpleLight saturate-50 text-white text-center font-bold hover:bg-twitchPurple px-4 py-2 rounded"
        >
          Buy me a coffee
        </a>
      </div>
    </header>
  );
};

export default Header;
