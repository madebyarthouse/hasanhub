import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "~/utils/prisma.server";
import refreshVideosData from "~/sync/_refreshVideoData";
import { json } from "@remix-run/node";

const minute = 1000 * 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;

export async function loader({ params }) {
  console.log(new Date(Date.now() - week));
  const videos = await prisma.video.findMany({
    where: {
      OR: [
        { updatedAt: { equals: null } },
        {
          AND: [
            { publishedAt: { lt: new Date(Date.now() - week) } }, // published in the last week
            { updatedAt: { lt: new Date(Date.now() - day) } }, // but not updated in the last day
          ],
        },
        {
          AND: [
            { publishedAt: { lt: new Date(Date.now() - week * 4) } }, // published in the last 4 weeks
            { updatedAt: { lt: new Date(Date.now() - week) } }, // but not updated in the last week
          ],
        },
        {
          AND: [
            { publishedAt: { lt: new Date(Date.now() - week * 12) } }, // published in the last 12 weeks
            { updatedAt: { lt: new Date(Date.now() - week * 4) } }, // but not updated in the last 4 week
          ],
        },
      ],
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 30,
  });

  const updated = await refreshVideosData(videos);

  return json({ titles: updated.map((video) => video.title) });
}
