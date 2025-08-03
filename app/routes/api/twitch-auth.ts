import { TwitchAuthService } from "~/lib/twitch-auth.server";

export async function loader() {
  try {
    const authService = TwitchAuthService.getInstance();
    const tokenInfo = await authService.getTokenInfo();

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
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const authService = TwitchAuthService.getInstance();
    const newToken = await authService.forceRefresh();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Token refreshed successfully",
        tokenLength: newToken.length, // Don't expose the actual token
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
}
