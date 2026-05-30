import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ReceiptRequestBody = {
  invoiceId?: string;
  childName?: string;
  amount?: number;
  dueDate?: string;
  status?: string;
  paymentMethod?: string;
  paidAt?: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ReceiptRequestBody>;
    const invoiceId = String(body.invoiceId ?? "").trim();
    const childName = String(body.childName ?? "").trim();
    const amount = Number(body.amount);

    if (!invoiceId || !childName || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "invoiceId, childName, and a valid amount are required." },
        { status: 400 },
      );
    }

    const receiptId = `RCPT-${invoiceId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`;
    const paidAt = body.paidAt ?? new Date().toISOString();
    const paymentMethod = body.paymentMethod ?? "WhatsApp reminder + Razorpay checkout";
    const dueDate = body.dueDate ?? "N/A";
    const status = body.status ?? "Paid";
    const amountLabel = formatCurrency(amount);

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; padding: 24px; max-width: 760px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:24px;">
          <div>
            <p style="margin:0; color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.18em;">EduLMS Receipt</p>
            <h1 style="margin:8px 0 0; font-size:28px;">Payment Receipt</h1>
          </div>
          <div style="text-align:right;">
            <p style="margin:0; font-size:12px; color:#6b7280;">Receipt ID</p>
            <p style="margin:0; font-size:18px; font-weight:700;">${receiptId}</p>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:16px;">
          <div style="border:1px solid #e5e7eb; border-radius:18px; padding:16px;">
            <p style="margin:0 0 6px; color:#6b7280; font-size:12px;">Student</p>
            <p style="margin:0; font-size:18px; font-weight:700;">${childName}</p>
          </div>
          <div style="border:1px solid #e5e7eb; border-radius:18px; padding:16px;">
            <p style="margin:0 0 6px; color:#6b7280; font-size:12px;">Invoice</p>
            <p style="margin:0; font-size:18px; font-weight:700;">${invoiceId}</p>
          </div>
          <div style="border:1px solid #e5e7eb; border-radius:18px; padding:16px;">
            <p style="margin:0 0 6px; color:#6b7280; font-size:12px;">Amount</p>
            <p style="margin:0; font-size:18px; font-weight:700;">${amountLabel}</p>
          </div>
          <div style="border:1px solid #e5e7eb; border-radius:18px; padding:16px;">
            <p style="margin:0 0 6px; color:#6b7280; font-size:12px;">Status</p>
            <p style="margin:0; font-size:18px; font-weight:700;">${status}</p>
          </div>
        </div>
        <div style="margin-top:16px; border:1px solid #e5e7eb; border-radius:18px; padding:16px;">
          <p style="margin:0 0 6px; color:#6b7280; font-size:12px;">Payment Method</p>
          <p style="margin:0; font-size:16px; font-weight:600;">${paymentMethod}</p>
          <p style="margin:12px 0 0; color:#6b7280; font-size:12px;">Due Date</p>
          <p style="margin:0; font-size:16px; font-weight:600;">${dueDate}</p>
          <p style="margin:12px 0 0; color:#6b7280; font-size:12px;">Paid At</p>
          <p style="margin:0; font-size:16px; font-weight:600;">${paidAt}</p>
        </div>
        <div style="margin-top:20px; padding-top:16px; border-top:1px solid #e5e7eb; color:#6b7280; font-size:13px;">
          This receipt can be downloaded, printed, or shared with the finance office for your records.
        </div>
      </div>
    `;

    const text = [
      "EduLMS Receipt",
      "",
      `Receipt ID: ${receiptId}`,
      `Student: ${childName}`,
      `Invoice: ${invoiceId}`,
      `Amount: ${amountLabel}`,
      `Status: ${status}`,
      `Payment Method: ${paymentMethod}`,
      `Due Date: ${dueDate}`,
      `Paid At: ${paidAt}`,
      "",
      "This receipt can be downloaded, printed, or shared with the finance office for your records.",
    ].join("\n");

    return NextResponse.json({
      demo: true,
      receipt: {
        receiptId,
        invoiceId,
        childName,
        amount,
        dueDate,
        status,
        paymentMethod,
        paidAt,
        fileName: `${receiptId.toLowerCase()}.html`,
        contentType: "text/html",
        html,
        text,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to build receipt.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
