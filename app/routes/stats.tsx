import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { cacheHeader } from "pretty-cache-header";
import { publishStatus } from "~/utils/dbEnums";
import { prisma } from "~/utils/prisma.server";

const getAggregationData = async () => {
  const [stats, statsWithoutMain, statsPerMonth, statsPerChannel] =
    await Promise.all([
      prisma.video.aggregate({
        _count: true,
        _sum: {
          views: true,
        },
        where: {
          publishStatus: publishStatus.Published,
        },
      }),
      prisma.video.aggregate({
        _count: true,
        _sum: {
          views: true,
        },
        where: {
          publishStatus: publishStatus.Published,
          channelId: 224,
        },
      }),
      prisma.$queryRaw`
      SELECT
        concat(year(v.publishedAt), '_', month(v.publishedAt)) yearWithMonth,
        count(*) videos_count,
        sum(v.views) views_sum
      FROM Video v
      GROUP BY yearWithMonth
      ORDER BY yearWithMonth desc
    `,
      prisma.$queryRaw`
      SELECT
        c.title as title,
        count(*) as videos_count,
        sum(v.views) as views_sum
      FROM Video v join Channel c on v.channelId = c.id
      GROUP BY c.title
      ORDER BY sum(views) desc
    `,
    ]);

  return { stats, statsWithoutMain, statsPerMonth, statsPerChannel };
};

export async function loader() {
  try {
    return json(await getAggregationData(), {
      status: 200,
      headers: {
        "Cache-Control": cacheHeader({
          maxAge: "1hour",
          sMaxage: "1hour",
          staleWhileRevalidate: "1day",
        }),
      },
    });
  } catch (e) {
    console.log({ error: e });

    return json({ error: e }, { status: 500 });
  } finally {
    prisma.$disconnect();
  }
}

type LoaderSuccessType = Awaited<ReturnType<typeof getAggregationData>>;
type LoaderFailureType = { error: string };
type LoaderDataType = LoaderSuccessType | LoaderFailureType;

export default function Stats() {
  const data = useLoaderData<LoaderDataType>();

  if ("error" in data) {
    return <div>Error fetching the page</div>;
  }

  const { stats, statsWithoutMain, statsPerMonth, statsPerChannel } = data;

  console.log(stats, statsWithoutMain, statsPerMonth, statsPerChannel);

  return (
    <div>
      <h1>Stats</h1>
      <p></p>

      <div className="flex flex-row items-center justify-around gap-10">
        <div className="text-center flex flex-col gap-3 text-white bg-twitchPurpleLight saturate-50 p-4">
          <h2>Total Videos (all)</h2>
          <p>{stats._count}</p>
        </div>

        <div className="text-center flex flex-col gap-3 text-white bg-twitchPurpleLight saturate-50 p-4">
          <h2>Total Views (all)</h2>
          <p>{(stats._sum.views ?? 0) / 1_000_000}</p>
        </div>

        <div className="text-center flex flex-col gap-3 text-white bg-twitchPurpleLight saturate-50 p-4">
          <h2>
            Total Videos (without{" "}
            <a href="https://youtube.com/c/hasanabi">HasanAbi</a>)
          </h2>
          <p>{statsWithoutMain._count}</p>
        </div>

        <div className="text-center flex flex-col gap-3 text-white bg-twitchPurpleLight saturate-50 p-4">
          <h2>
            Total Views (without{" "}
            <a href="https://youtube.com/c/hasanabi">HasanAbi</a>)
          </h2>
          <p>{(statsWithoutMain._sum.views ?? 0) / 1_000_000}</p>
        </div>
      </div>
    </div>
  );
}
