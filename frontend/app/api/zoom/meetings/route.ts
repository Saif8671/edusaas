import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CreateZoomMeetingBody = {
  title?: string;
  batch?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  notes?: string;
  timezone?: string;
  hostUserId?: string;
};

type ZoomTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type ZoomMeetingResponse = {
  id: number;
  join_url: string;
  start_url: string;
  password?: string;
  topic: string;
  start_time: string;
  timezone: string;
};

function buildStartTime(date?: string, time?: string) {
  if (!date || !time) return "";

  const normalized = time.trim().toUpperCase();
  let normalizedTime = normalized;

  if (normalized.includes("AM") || normalized.includes("PM")) {
    const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (!match) return "";

    let hours = Number(match[1]);
    const minutes = match[2];
    const meridiem = match[3];

    if (meridiem === "AM") {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }

    normalizedTime = `${String(hours).padStart(2, "0")}:${minutes}:00`;
  } else if (/^\d{1,2}:\d{2}$/.test(normalized)) {
    normalizedTime = `${normalized}:00`;
  }

  return `${date}T${normalizedTime}`;
}

async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_S2S_ACCOUNT_ID;
  const clientId = process.env.ZOOM_S2S_CLIENT_ID;
  const clientSecret = process.env.ZOOM_S2S_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    return null;
  }

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zoom auth failed: ${errorText}`);
  }

  return (await response.json()) as ZoomTokenResponse;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateZoomMeetingBody>;
    const title = body.title?.trim();
    const batch = body.batch?.trim();
    const date = body.date?.trim();
    const time = body.time?.trim();
    const durationMinutes = Number(body.durationMinutes ?? 60);
    const notes = body.notes?.trim();
    const timezone = body.timezone?.trim() || process.env.ZOOM_TIMEZONE || "Asia/Kolkata";
    const hostUserId = body.hostUserId?.trim() || process.env.ZOOM_HOST_USER_ID || "me";
    const startTime = buildStartTime(date, time);

    if (!title || !batch || !date || !time) {
      return NextResponse.json(
        { error: "Title, batch, date, and time are required to create a Zoom meeting." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 1440) {
      return NextResponse.json({ error: "Duration must be between 1 and 1440 minutes." }, { status: 400 });
    }

    const topic = `${title} - ${batch}`;
    const agenda = notes || `Live class for ${batch}`;

    const authConfigured =
      process.env.ZOOM_S2S_ACCOUNT_ID &&
      process.env.ZOOM_S2S_CLIENT_ID &&
      process.env.ZOOM_S2S_CLIENT_SECRET;

    if (!authConfigured) {
      const demoId = 700_000_000 + Math.floor(Math.random() * 100_000_000);
      return NextResponse.json({
        demo: true,
        meeting: {
          id: demoId,
          join_url: `https://zoom.us/j/${demoId}`,
          start_url: `https://zoom.us/s/${demoId}?zak=demo`,
          password: "123456",
          topic,
          start_time: startTime,
          timezone,
        } satisfies ZoomMeetingResponse,
      });
    }

    const tokenResponse = await getZoomAccessToken();
    if (!tokenResponse?.access_token) {
      return NextResponse.json({ error: "Unable to generate a Zoom access token." }, { status: 500 });
    }

    const meetingResponse = await fetch(
      `https://api.zoom.us/v2/users/${encodeURIComponent(hostUserId)}/meetings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          type: 2,
          start_time: startTime,
          duration: durationMinutes,
          timezone,
          agenda,
          default_password: true,
          settings: {
            join_before_host: false,
            waiting_room: true,
            mute_upon_entry: true,
            host_video: true,
            participant_video: false,
            auto_recording: "none",
            email_notification: false,
          },
        }),
      },
    );

    if (!meetingResponse.ok) {
      const errorText = await meetingResponse.text();
      return NextResponse.json(
        { error: "Unable to create Zoom meeting.", details: errorText },
        { status: meetingResponse.status },
      );
    }

    const meeting = (await meetingResponse.json()) as ZoomMeetingResponse;
    return NextResponse.json({ demo: false, meeting });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create Zoom meeting.",
      },
      { status: 500 },
    );
  }
}
