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

export const getStreamInfo = async () => {
  return await Promise.all([
    fetch(`https://api.twitch.tv/helix/streams?first=1&user_id=${207813352}`, {
      headers: {
        "Client-Id": process.env.TWITCH_CLIENT_ID?.trim() ?? "",
        Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN ?? ""}`,
      },
    }).then((res) => res.json()) as unknown as StreamInfo,
    fetch(`https://api.twitch.tv/helix/schedule?broadcaster_id=${207813352}`, {
      headers: {
        "Client-Id": process.env.TWITCH_CLIENT_ID?.trim() ?? "",
        Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN ?? ""}`,
      },
    }).then((res) => res.json()) as unknown as StreamSchedule,
  ]);
};
