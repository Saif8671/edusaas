import { NextResponse } from "next/server";

export const runtime = "nodejs";

type EmailRequest = {
  to?: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  from?: string;
};

async function readResponseError(response: Response) {
  return response.text();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmailRequest;
    const to = body.to;
    const subject = body.subject?.trim();
    const html = body.html?.trim();
    const text = body.text?.trim();
    const from = body.from?.trim() || process.env.RESEND_FROM_EMAIL || "EduSaaS <noreply@edusaas.com>";
    const apiKey = process.env.RESEND_API_KEY;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: "Recipient, subject, and either html or text are required." },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json({
        demo: true,
        provider: "Resend",
        message: "Email queued in demo mode because RESEND_API_KEY is not configured.",
        payload: { to, subject, from },
      });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const details = await readResponseError(response);
      return NextResponse.json(
        { error: "Unable to send email.", details },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json({ demo: false, provider: "Resend", result });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to send email.",
      },
      { status: 500 },
    );
  }
}
