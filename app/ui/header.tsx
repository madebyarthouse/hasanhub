import { Link } from "@remix-run/react";

// Utility Functions
const getTimeUntilStream = (startTime: string) => {
  const now = new Date();
  const streamStart = new Date(startTime);
  const diffMs = streamStart.getTime() - now.getTime();

  // Don't go negative, minimum is 0
  if (diffMs <= 0) {
    return "0 minutes";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours >= 1) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  } else {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  }
};

// Icon Components
const TwitterIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

// Layout Components
const SocialLinks = () => {
  return (
    <div className="flex gap-2 items-center">
      <a
        href="https://twitter.com/hasanhub_com"
        target="_blank"
        rel="noreferrer"
        aria-label="Follow on Twitter"
        className="text-[#1DA1F2] hover:text-[#0d8bd9] transition-colors duration-200 p-2"
      >
        <TwitterIcon />
      </a>
      <a
        href="https://github.com/madebyarthouse/hasanhub"
        target="_blank"
        rel="noreferrer"
        aria-label="View on GitHub"
        className="text-[#333333] dark:text-white hover:text-[#000000] dark:hover:text-gray-300 transition-colors duration-200 p-2"
      >
        <GitHubIcon />
      </a>
    </div>
  );
};

const TopBar = () => {
  return (
    <div className="flex justify-between items-center w-full pb-4">
      <div className="flex flex-row gap-2 items-center text-sm">
        Made by{" "}
        <a
          href="https://chrcit.com/projects/hasanhub-com"
          className="underline underline-offset-2 font-semibold"
        >
          chrcit
        </a>
      </div>
      <SocialLinks />
    </div>
  );
};

const Logo = () => {
  return (
    <Link
      to="/"
      prefetch="render"
      className="flex items-center justify-center sm:justify-start"
    >
      <h1 className="text-[2.25rem] md:text-[2.5rem] font-bold group inline-block w-min whitespace-nowrap">
        <span>Hasan</span>
        <span className="dark:text-lightBlack text-light inline-block bg-twitchPurpleLight group-hover:bg-twitchPurple px-2 py-1 ml-2 rounded-lg saturate-50">
          Hub
        </span>
      </h1>
    </Link>
  );
};

// Component-specific types that match the transformed data from root.tsx
type StreamInfoDisplay = {
  user_login: string;
  user_name: string;
  title: string;
};

type StreamScheduleDisplay = {
  broadcaster_login: string;
  broadcaster_name: string;
  start_time: string;
  title: string;
};

const StreamInfoComponent = ({
  streamInfo,
  streamSchedule,
}: {
  streamInfo?: StreamInfoDisplay;
  streamSchedule?: StreamScheduleDisplay;
}) => {
  return (
    <div className="flex items-center gap-2">
      {streamInfo ? (
        <a
          className="flex items-start gap-2 hover:text-twitchPurple dark:hover:text-twitchPurpleLight saturate-50"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://twitch.tv/${streamInfo.user_login}`}
        >
          <svg
            className="w-5 h-5 text-twitchPurple dark:text-twitchPurpleLight saturate-50 flex-shrink-0 relative top-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
          <p className="max-w-[60ch]">
            <strong className="text-twitchPurple dark:text-twitchPurpleLight saturate-50">
              {streamInfo.user_name}
            </strong>{" "}
            is live now:{" "}
            <span className="text-twitchPurple dark:text-twitchPurpleLight saturate-50">
              {streamInfo.title}
            </span>
          </p>
        </a>
      ) : (
        streamSchedule && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-twitchPurple dark:hover:text-twitchPurpleLight saturate-50"
            href={`https://twitch.tv/${streamSchedule.broadcaster_login}`}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 text-twitchPurple dark:text-twitchPurpleLight saturate-50"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
            </svg>
            <p>
              <strong className="text-twitchPurple dark:text-twitchPurpleLight saturate-50">
                {streamSchedule.broadcaster_name}
              </strong>{" "}
              is live in {getTimeUntilStream(streamSchedule.start_time)}
            </p>
          </a>
        )
      )}
    </div>
  );
};

// Main Header Component
const Header = ({
  streamInfo,
  streamSchedule,
}: {
  streamInfo?: StreamInfoDisplay;
  streamSchedule?: StreamScheduleDisplay;
}) => {
  return (
    <header className="px-5 lg:px-10 xl:px-14 pt-6">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Logo />
        <StreamInfoComponent
          streamInfo={streamInfo}
          streamSchedule={streamSchedule}
        />
      </div>
    </header>
  );
};

// Export individual components for use in other layouts
export { Logo, TopBar, StreamInfoComponent, SocialLinks };
export default Header;
