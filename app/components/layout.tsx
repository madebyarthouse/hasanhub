import type { StreamInfo, StreamSchedule } from "~/lib/getStreamInfo.server";
import Header from "~/components/header";

const Layout = ({
  children,
  streamInfo,
  streamSchedule,
}: {
  children: React.ReactNode;
  streamInfo: StreamInfo;
  streamSchedule: StreamSchedule;
}) => {
  return (
    <>
      <Header streamInfo={streamInfo} streamSchedule={streamSchedule} />
      <main className="mx-auto items-start px-0 lg:px-10 xl:px-14 flex flex-col lg:flex-row relative lg:gap-20">
        {children}
      </main>
    </>
  );
};

export default Layout;
