import {
  getTokenInfo,
  refreshAccessToken,
} from "~/lib/twitch-auth.server";
import type { Route } from "./+types/twitch-auth";

export const loader = async (_args: Route.LoaderArgs) => {
  try {
    const tokenInfo = await getTokenInfo();

    return new Response(JSON.stringify(tokenInfo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting Twitch auth info:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to get auth info",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const newToken = await refreshAccessToken();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Token refreshed successfully",
        tokenLength: newToken.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error refreshing Twitch token:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to refresh token",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
