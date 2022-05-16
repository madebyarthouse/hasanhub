import { Link } from "@remix-run/react";
import type { StreamInfo, StreamSchedule } from "~/lib/getStreamInfo.server";

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

const Header = ({
  streamInfo,
  streamSchedule,
}: {
  streamInfo: StreamInfo;
  streamSchedule: StreamSchedule;
}) => {
  console.log(streamInfo, streamSchedule);
  return (
    <header className="px-5 lg:px-10 xl:px-14 my-6 flex gap-3 sm:gap-0 flex-col sm:flex-row justify-between">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link to="/" prefetch="render">
          <h1 className="text-4xl lg:text-7xl font-bold sm:text-left group text-center">
            Hasan
            <span className="dark:text-black text-white inline-block bg-twitchPurpleLight group-hover:bg-twitchPurple p-2 ml-2 rounded-lg saturate-50">
              Hub
            </span>
          </h1>
        </Link>

        <div className="flex flex-col text-sm text-center sm:text-left">
          {streamInfo.data?.length > 0 ? (
            <a
              className="hover:text-twitchPurple saturate-50"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://twitch.tv/${streamInfo.data[0]["user_login"]}`}
            >
              <p className="">
                <strong className="text-twitchPurple saturate-50">
                  {streamInfo.data[0]["user_name"]}
                </strong>{" "}
                is live now: <br />"{streamInfo.data[0]["title"]}"
              </p>
            </a>
          ) : (
            streamSchedule.data && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-twitchPurple saturate-50"
                href={`https://twitch.tv/${streamSchedule.data["broadcaster_login"]}`}
              >
                <p>
                  <strong className="text-twitchPurple saturate-50">
                    {streamSchedule.data?.["broadcaster_name"]}
                  </strong>{" "}
                  is live at{" "}
                  <strong className="text-twitchPurple saturate-50">
                    {formatDate(
                      streamSchedule.data?.["segments"][0]["start_time"]
                    )}
                  </strong>{" "}
                  <br />"{streamSchedule.data?.["segments"][0]["title"]}"
                </p>
              </a>
            )
          )}
        </div>
      </div>

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
