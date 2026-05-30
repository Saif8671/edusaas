import { NextResponse } from "next/server";

export const runtime = "nodejs";

type WhatsAppRequest = {
  to?: string;
  body?: string;
  from?: string;
};

async function readResponseError(response: Response) {
  return response.text();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WhatsAppRequest;
    const to = body.to?.trim();
    const message = body.body?.trim();
    const from = body.from?.trim() || process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_TOKEN;

    if (!to || !message) {
      return NextResponse.json({ error: "Recipient and message are required." }, { status: 400 });
    }

    if (!accountSid || !authToken) {
      return NextResponse.json({
        demo: true,
        provider: "Twilio",
        message: "WhatsApp message queued in demo mode because Twilio credentials are missing.",
        payload: { to, from },
      });
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: to,
        Body: message,
      }).toString(),
    });

    if (!response.ok) {
      const details = await readResponseError(response);
      return NextResponse.json(
        { error: "Unable to send WhatsApp message.", details },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json({ demo: false, provider: "Twilio", result });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to send WhatsApp message.",
      },
      { status: 500 },
    );
  }
}
