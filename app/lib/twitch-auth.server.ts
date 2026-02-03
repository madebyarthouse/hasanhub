import { env } from "cloudflare:workers";
import { desc, lt } from "drizzle-orm";
import { db } from "../../db/client";
import { TwitchAuth } from "../../db/schema";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

const getClientConfig = () => {
  const clientId = env.TWITCH_CLIENT_ID || "";
  const clientSecret = env.TWITCH_CLIENT_SECRET || "";

  if (!clientId || !clientSecret) {
    throw new Error("TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set");
  }

  return { clientId, clientSecret };
};

const getCurrentAuth = async () => {
  const rows = await db
    .select()
    .from(TwitchAuth)
    .orderBy(desc(TwitchAuth.createdAt))
    .limit(1);

  return rows[0] ?? null;
};

const isTokenValid = (expiresAt: string) => {
  const now = new Date();
  const bufferTime = 5 * 60 * 1000;
  const expires = new Date(expiresAt);
  return expires.getTime() > now.getTime() + bufferTime;
};

export const refreshAccessToken = async () => {
  const { clientId, clientSecret } = getClientConfig();

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to refresh token: ${errorData.message || response.statusText}`
    );
  }

  const tokenData = (await response.json()) as TwitchTokenResponse;
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

  const inserted = await db
    .insert(TwitchAuth)
    .values({
      accessToken: tokenData.access_token,
      expiresAt: expiresAt.toISOString(),
      tokenType: tokenData.token_type,
      createdAt: new Date().toISOString(),
    })
    .returning();

  const saved = inserted[0];
  return saved?.accessToken ?? tokenData.access_token;
};

export const getValidAccessToken = async () => {
  const current = await getCurrentAuth();
  if (current && current.expiresAt && isTokenValid(current.expiresAt)) {
    return current.accessToken;
  }

  return refreshAccessToken();
};

export const getTokenInfo = async () => {
  const auth = await getCurrentAuth();
  if (!auth) {
    return { status: "no_token", message: "No token found in database" };
  }

  const isValid = isTokenValid(auth.expiresAt);
  return {
    status: isValid ? "valid" : "expired",
    expiresAt: auth.expiresAt,
    createdAt: auth.createdAt,
    tokenType: auth.tokenType,
  };
};

export const cleanupExpiredTokens = async () => {
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString();
  return db.delete(TwitchAuth).where(lt(TwitchAuth.createdAt, cutoff));
};
