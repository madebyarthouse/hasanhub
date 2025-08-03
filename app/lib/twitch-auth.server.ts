import { prisma } from "~/utils/prisma.server";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class TwitchAuthService {
  private static instance: TwitchAuthService;
  private clientId: string;
  private clientSecret: string;

  private constructor() {
    this.clientId = process.env.TWITCH_CLIENT_ID || "";
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || "";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set");
    }
  }

  public static getInstance(): TwitchAuthService {
    if (!TwitchAuthService.instance) {
      TwitchAuthService.instance = new TwitchAuthService();
    }
    return TwitchAuthService.instance;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    const currentAuth = await this.getCurrentAuth();

    if (currentAuth && this.isTokenValid(currentAuth.expiresAt)) {
      return currentAuth.accessToken;
    }

    // Token is expired or doesn't exist, refresh it
    return this.refreshAccessToken();
  }

  /**
   * Get the current auth record from database
   */
  private async getCurrentAuth() {
    return await prisma.twitchAuth.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Check if token is still valid (with 5 minute buffer)
   */
  private isTokenValid(expiresAt: Date): boolean {
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return expiresAt.getTime() > now.getTime() + bufferTime;
  }

  /**
   * Refresh the access token from Twitch
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "client_credentials",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to refresh token: ${errorData.message || response.statusText}`
        );
      }

      const tokenData: TwitchTokenResponse = await response.json();

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

      // Store in database
      const savedAuth = await prisma.twitchAuth.create({
        data: {
          accessToken: tokenData.access_token,
          expiresAt: expiresAt,
          tokenType: tokenData.token_type,
        },
      });

      console.log(
        `New Twitch token saved, expires at: ${expiresAt.toISOString()}`
      );

      return savedAuth.accessToken;
    } catch (error) {
      console.error("Error refreshing Twitch access token:", error);
      throw error;
    }
  }

  /**
   * Force refresh the token (useful for manual refresh)
   */
  async forceRefresh(): Promise<string> {
    return this.refreshAccessToken();
  }

  /**
   * Get token info for debugging
   */
  async getTokenInfo() {
    const auth = await this.getCurrentAuth();
    if (!auth) {
      return { status: "no_token", message: "No token found in database" };
    }

    const isValid = this.isTokenValid(auth.expiresAt);
    return {
      status: isValid ? "valid" : "expired",
      expiresAt: auth.expiresAt,
      createdAt: auth.createdAt,
      tokenType: auth.tokenType,
    };
  }
}

/**
 * Convenience function to get a valid token
 */
export async function getTwitchAccessToken(): Promise<string> {
  const authService = TwitchAuthService.getInstance();
  return authService.getValidAccessToken();
}
