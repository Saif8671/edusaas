import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CreateOrderBody = {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateOrderBody>;
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "A valid amount is required." }, { status: 400 });
    }

    const currency = body.currency ?? "INR";
    const receipt = body.receipt ?? `rcpt_${Date.now()}`;
    const notes = body.notes ?? {};

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({
        demo: true,
        keyId: null,
        order: {
          id: `order_demo_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency,
          receipt,
          status: "created",
        },
      });
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        notes,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Unable to create Razorpay order.", details: errorText },
        { status: response.status },
      );
    }

    const order = await response.json();
    return NextResponse.json({ demo: false, keyId, order });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to create payment order.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
