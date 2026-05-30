import { NextResponse } from "next/server";

export const runtime = "nodejs";

type InvoiceRequestBody = {
  invoiceId?: string;
  childName?: string;
  amount?: number;
  dueDate?: string;
  status?: string;
  paymentMethod?: string;
  paidAt?: string;
  description?: string;
  courseName?: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildInvoiceHtml(payload: {
  invoiceId: string;
  receiptId: string;
  childName: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentMethod: string;
  paidAt: string;
  description: string;
  courseName: string;
  issuedAt: string;
}) {
  const amountLabel = formatCurrency(payload.amount);
  const isPaid = payload.status === "Paid";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${payload.invoiceId} - EduSaaS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #f8fafc; padding: 32px 16px; }
    .invoice { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(15,23,42,0.08); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding: 32px 36px; background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%); color: #fff; }
    .brand h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
    .brand p { margin-top: 6px; font-size: 13px; opacity: 0.85; }
    .meta { text-align: right; }
    .meta .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.75; }
    .meta .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .meta .sub { margin-top: 10px; font-size: 13px; opacity: 0.9; }
    .body { padding: 32px 36px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; }
    .card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-bottom: 8px; }
    .card .value { font-size: 16px; font-weight: 600; color: #0f172a; }
    .card .hint { margin-top: 6px; font-size: 13px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; padding: 12px 16px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    td.amount { text-align: right; font-weight: 600; }
    .totals { margin-left: auto; width: 280px; }
    .totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; }
    .totals .grand { border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 700; color: #0f172a; }
    .status { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .status.paid { background: #dcfce7; color: #166534; }
    .status.pending { background: #fef3c7; color: #92400e; }
    .status.overdue { background: #fee2e2; color: #991b1b; }
    .footer { padding: 24px 36px 32px; border-top: 1px solid #e2e8f0; background: #f8fafc; font-size: 13px; color: #64748b; line-height: 1.7; }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="brand">
        <h1>EduSaaS</h1>
        <p>Learning Management &amp; Finance Portal</p>
        <p style="margin-top:4px;">123 Academic Avenue, Bengaluru, KA 560001</p>
      </div>
      <div class="meta">
        <div class="label">Tax Invoice</div>
        <div class="value">${payload.invoiceId}</div>
        <div class="sub">Receipt: ${payload.receiptId}</div>
        <div class="sub">Issued: ${formatDate(payload.issuedAt)}</div>
      </div>
    </div>
    <div class="body">
      <div class="grid">
        <div class="card">
          <div class="label">Bill To</div>
          <div class="value">${payload.childName}</div>
          <div class="hint">Student / Parent account</div>
        </div>
        <div class="card">
          <div class="label">Payment Status</div>
          <div class="value"><span class="status ${isPaid ? "paid" : payload.status === "Overdue" ? "overdue" : "pending"}">${payload.status}</span></div>
          <div class="hint">${isPaid ? `Paid on ${formatDate(payload.paidAt)}` : `Due by ${formatDate(payload.dueDate)}`}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Course</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${payload.description}</td>
            <td>${payload.courseName}</td>
            <td class="amount">${amountLabel}</td>
          </tr>
        </tbody>
      </table>
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>${amountLabel}</span></div>
        <div class="row"><span>GST (0%)</span><span>${formatCurrency(0)}</span></div>
        <div class="row grand"><span>Total Due</span><span>${amountLabel}</span></div>
      </div>
      ${isPaid ? `<p style="margin-top:24px;font-size:14px;color:#475569;"><strong>Payment method:</strong> ${payload.paymentMethod}</p>` : ""}
    </div>
    <div class="footer">
      This is a computer-generated invoice from EduSaaS. For finance queries, contact accounts@edusaas.in.
      ${isPaid ? " This document serves as proof of payment." : " Please pay before the due date to avoid late fees."}
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<InvoiceRequestBody>;
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
    const paymentMethod = body.paymentMethod ?? "Razorpay UPI / Online Checkout";
    const dueDate = body.dueDate ?? new Date().toISOString();
    const status = body.status ?? "Pending";
    const description = body.description ?? "Tuition & course fee";
    const courseName = body.courseName ?? "Academic Program";
    const issuedAt = new Date().toISOString();

    const payload = {
      invoiceId,
      receiptId,
      childName,
      amount,
      dueDate,
      status,
      paymentMethod,
      paidAt,
      description,
      courseName,
      issuedAt,
    };

    const html = buildInvoiceHtml(payload);
    const amountLabel = formatCurrency(amount);

    const text = [
      "EduSaaS Tax Invoice",
      "",
      `Invoice ID: ${invoiceId}`,
      `Receipt ID: ${receiptId}`,
      `Student: ${childName}`,
      `Course: ${courseName}`,
      `Description: ${description}`,
      `Amount: ${amountLabel}`,
      `Status: ${status}`,
      `Due Date: ${formatDate(dueDate)}`,
      status === "Paid" ? `Paid At: ${formatDate(paidAt)}` : "",
      status === "Paid" ? `Payment Method: ${paymentMethod}` : "",
      "",
      "Generated by EduSaaS Finance Portal",
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({
      demo: true,
      invoice: {
        ...payload,
        amountLabel,
        fileName: `invoice-${invoiceId.toLowerCase()}.html`,
        contentType: "text/html;charset=utf-8",
        html,
        text,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to generate invoice.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
