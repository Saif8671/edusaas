import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody;
    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!orderId || !paymentId) {
      return NextResponse.json({ verified: false, error: "Missing payment identifiers." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json({ verified: true, demo: true });
    }

    if (!signature) {
      return NextResponse.json({ verified: false, error: "Missing Razorpay signature." }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const verified =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    return NextResponse.json({ verified, demo: false });
  } catch (error) {
    return NextResponse.json(
      {
        verified: false,
        error: error instanceof Error ? error.message : "Unable to verify payment.",
      },
      { status: 500 },
    );
  }
}
