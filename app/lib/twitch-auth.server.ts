import { env } from "cloudflare:workers";
import { desc } from "drizzle-orm";
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
    .orderBy(desc(TwitchAuth.id))
    .limit(1);

  return rows[0] ?? null;
};

const isTokenValid = (expiresAt: string) => {
  const now = new Date();
  const bufferTime = 5 * 60 * 1000;
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  return expires.getTime() > now.getTime() + bufferTime;
};

const getErrorText = async (response: Response) => {
  try {
    const data = (await response.json()) as {
      message?: string;
      error_description?: string;
      error?: string;
    };
    return (
      data.message ?? data.error_description ?? data.error ?? `HTTP ${response.status}`
    );
  } catch {
    return `HTTP ${response.status}`;
  }
};

const saveAuthToken = async (
  token: string,
  tokenType: string,
  expiresAt: string
) => {
  const timestamp = new Date().toISOString();
  const inserted = await db
    .insert(TwitchAuth)
    .values({
      accessToken: token,
      expiresAt,
      tokenType,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  return inserted[0] ?? null;
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
    const errorText = await getErrorText(response);
    throw new Error(
      `Failed to refresh token: ${errorText || response.statusText}`
    );
  }

  const tokenData = (await response.json()) as TwitchTokenResponse;
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

  const saved = await saveAuthToken(
    tokenData.access_token,
    tokenData.token_type,
    expiresAt.toISOString()
  );

  if (!saved) {
    return tokenData.access_token;
  }

  return saved.accessToken;
};

export const getValidAccessToken = async (options?: {
  forceRefresh?: boolean;
}) => {
  const current = await getCurrentAuth();
  if (
    !options?.forceRefresh &&
    current &&
    current.expiresAt &&
    isTokenValid(current.expiresAt)
  ) {
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
