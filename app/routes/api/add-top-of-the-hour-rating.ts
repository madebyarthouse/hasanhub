import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/utils/prisma.server";

const requestValidator = z.object({
  rating: z.number().min(0).max(5),
  streamUuid: z.string(),
  timestamp: z.string(),
  secret: z.string(),
});

export async function action(args: DataFunctionArgs) {
  if (args.request.method === "POST") {
    try {
      const data = await args.request.json();

      const validatedData = requestValidator.parse(data);
      if (validatedData.secret !== process.env.TOP_OF_THE_HOUR_SECRET) {
        return json({ error: "Invalid secret" }, { status: 403 });
      }

      await prisma.topOfTheHourRating.create({
        data: {
          rating: validatedData.rating,
          streamUuid: validatedData.streamUuid,
          ratedAt: new Date(parseInt(validatedData.timestamp) * 1000),
        },
      });

      return json({ message: "rating created" }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json({ error: JSON.stringify(error.message) }, { status: 400 });
      }

      return json({ error });
    } finally {
      await prisma.$disconnect();
    }
  }

  return json({ error: "Only POST is supported" }, { status: 400 });
}
