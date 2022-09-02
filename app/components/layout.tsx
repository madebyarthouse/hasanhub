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
    <div className="flex flex-col gap-10">
      <Header streamInfo={streamInfo} streamSchedule={streamSchedule} />
      <main className="mx-auto items-start px-5 lg:px-10 xl:px-14  w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
