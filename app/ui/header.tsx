import { Link } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { fetchStreamInfo } from "~/queries/fetch-stream-data";
("~/lib/getStreamInfo.server");

const formatDate = (date: string | Date) => {
  if (typeof date === "string") {
    return (
      new Date(date).toLocaleDateString() +
      " " +
      new Date(date).toLocaleTimeString()
    );
  }

  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const Header = () => {
  const { data } = useQuery({
    queryKey: ["streamInfo"],
    queryFn: fetchStreamInfo,
  });

  const { streamInfo, schedule } = data ?? { streamInfo: null, schedule: null };

  return (
    <header className="px-5 lg:px-10 xl:px-14 my-6  gap-y-10 gap-x-5 lg:gap-x-14 grid grid-cols-1 grid-rows-[auto_auto_auto] sm:grid-cols-2 sm:grid-rows-[auto_auto] xl:grid-rows-1 lg:grid-cols-[25%_auto] xl:grid-cols-[20%_auto_auto]">
      <Link
        to="/"
        prefetch="render"
        className="col-span-1 sm:col-span-1 flex items-center justify-center sm:justify-start"
      >
        <h1 className="text-[2.5rem] font-bold sm:text-left group text-center inline-block w-min whitespace-nowrap">
          <span>Hasan</span>
          <span className="dark:text-lightBlack text-light inline-block bg-twitchPurpleLight group-hover:bg-twitchPurple px-2 py-1 ml-2 rounded-lg saturate-50 transition-colors">
            Hub
          </span>
        </h1>
      </Link>

      <div className="col-span-1 row-start-3 sm:col-span-2 sm:row-start-2 xl:row-start-1 xl:col-start-2 xl:col-span-1 w-full  xl:max-w-[60ch] flex items-center justify-center xl:justify-start text-center xl:text-left text-base md:text-lg">
        {streamInfo ? (
          <a
            className="hover:text-twitchPurple dark:hover:text-twitchPurpleLight saturate-50 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://twitch.tv/${streamInfo["user_login"]}`}
          >
            <p className="">
              <strong className="text-twitchPurple dark:text-twitchPurpleLight saturate-50">
                {streamInfo["user_name"]}
              </strong>{" "}
              is live now: <br />"{streamInfo["title"]}"
            </p>
          </a>
        ) : (
          schedule && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-twitchPurple dark:hover:text-twitchPurpleLight saturate-50 transition-colors"
              href={`https://twitch.tv/${schedule["broadcaster_login"]}`}
            >
              <p>
                <strong className="text-twitchPurple dark:text-twitchPurpleLight saturate-50">
                  {schedule["broadcaster_name"]}
                </strong>{" "}
                is live at{" "}
                <strong className="text-twitchPurple dark:text-twitchPurpleLight saturate-50">
                  {formatDate(schedule["start_time"])}
                </strong>{" "}
                <br />"{schedule["title"]}".
              </p>
            </a>
          )
        )}
      </div>

      <div className="col-span-1 row-start-2 sm:row-start-1 sm:col-start-2 sm:col-span-1 xl:col-start-3 flex flex-row gap-2 justify-center md:justify-end items-center text-sm md:text-base">
        <a
          href="https://twitter.com/chrcit"
          target="_blank"
          rel="noreferrer"
          className="bg-twitchPurpleLight saturate-50 text-light text-center font-bold transition-colors betterhover:hover:bg-twitchPurple px-4 py-2 rounded"
        >
          Made by @chrcit
        </a>
        <a
          href="https://buymeacoffee.com/chrcit"
          target="_blank"
          rel="noreferrer"
          className="bg-twitchPurpleLight saturate-50 text-light text-center font-bold transition-colors betterhover:hover:bg-twitchPurple px-4 py-2 rounded"
        >
          Buy me a coffee
        </a>
      </div>
    </header>
  );
};

export default Header;
