import { env } from "cloudflare:workers";
import { getValidAccessToken } from "./twitch-auth.server";

export type StreamInfo = {
  data: {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: string;
    title: string;
    viewer_count: number;
    started_at: Date;
    language: string;
    thumbnail_url: string;
    tag_ids: string[];
    is_mature: boolean;
  }[];
  pagination: {
    cursor: string;
  };
};

export type StreamSchedule = {
  data: {
    segments: {
      id: string;
      start_time: Date;
      end_time: Date;
      title: string;
      canceled_until?: any;
      category: {
        id: string;
        name: string;
      };
      is_recurring: boolean;
    }[];
    broadcaster_id: string;
    broadcaster_name: string;
    broadcaster_login: string;
    vacation?: any;
  };
  pagination: {};
};

type StreamInfoError = {
  status: number;
  endpoint: string;
  body: string;
  message: string;
  unauthorized: boolean;
};

const parseBody = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const fetchTwitchJson = async <T>(
  endpoint: string,
  accessToken: string,
  clientId: string
): Promise<T> => {
  const response = await fetch(endpoint, {
    headers: {
      "Client-Id": clientId,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const body = await parseBody(response);
    const bodyText =
      typeof body === "string"
        ? body
        : JSON.stringify(body) || response.statusText;
    const message = `Twitch API error at ${endpoint}: ${response.status} ${response.statusText} (${bodyText})`;
    throw {
      status: response.status,
      endpoint,
      body: typeof bodyText === "string" ? bodyText : String(bodyText),
      message,
      unauthorized: response.status === 401 || response.status === 403,
    } as StreamInfoError;
  }

  return (await response.json()) as T;
};

const getStreamInfoFromToken = async (accessToken: string) => {
  const clientId = env.TWITCH_CLIENT_ID?.trim() ?? "";

  return await Promise.all([
    fetchTwitchJson<StreamInfo>(
      "https://api.twitch.tv/helix/streams?first=1&user_id=207813352",
      accessToken,
      clientId
    ),
    fetchTwitchJson<StreamSchedule>(
      "https://api.twitch.tv/helix/schedule?broadcaster_id=207813352",
      accessToken,
      clientId
    ),
  ]);
};

export const getStreamInfo = async () => {
  const accessToken = await getValidAccessToken();

  try {
    return await getStreamInfoFromToken(accessToken);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      (error as StreamInfoError).unauthorized
    ) {
      const refreshedToken = await getValidAccessToken({ forceRefresh: true });
      return getStreamInfoFromToken(refreshedToken);
    }

    throw error;
  }
};
