import { z } from "zod";
import { TopOfTheHourRating } from "../../../db/schema";
import { env } from "cloudflare:workers";
import { db } from "../../../db/client";
import type { Route } from "./+types/add-top-of-the-hour-rating";

const requestValidator = z.object({
  rating: z.number(),
  streamUuid: z.string(),
  timestamp: z.number(),
  secret: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST is supported" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await request.json();
    const validated = requestValidator.parse(data);
    if (validated.secret !== env.TOP_OF_THE_HOUR_SECRET) {
      return new Response(JSON.stringify({ error: "Invalid secret" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.insert(TopOfTheHourRating).values({
      rating: validated.rating,
      streamUuid: validated.streamUuid,
      ratedAt: new Date(validated.timestamp * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ message: "rating created" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
