"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  CreditCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";
import { useAppStore, type InvoiceData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: (payload: unknown) => void) => void;
};

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const paymentMethods = [
  {
    id: "upi",
    title: "UPI / QR",
    description: "Pay using any UPI app",
    icon: Smartphone,
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-600",
  },
  {
    id: "card",
    title: "Card",
    description: "Debit or credit card",
    icon: CreditCard,
    accent: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  },
  {
    id: "wallet",
    title: "Wallet",
    description: "Paytm, PhonePe, etc.",
    icon: Wallet,
    accent: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  {
    id: "netbanking",
    title: "Net Banking",
    description: "All major banks",
    icon: ShieldCheck,
    accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
] as const;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

async function createOrder(invoice: InvoiceData, referenceNote?: string) {
  const response = await fetch("/api/razorpay/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: invoice.amount,
      currency: "INR",
      receipt: invoice.id,
      notes: {
        childName: invoice.childName,
        invoiceId: invoice.id,
        ...(referenceNote ? { referenceNote } : {}),
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to create the Razorpay order.");
  }

  return (await response.json()) as {
    demo: boolean;
    keyId: string | null;
    order: {
      id: string;
      amount: number;
      currency: string;
    };
  };
}

async function verifyPayment(response: RazorpayPaymentResponse) {
  const verifyResponse = await fetch("/api/razorpay/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response),
  });

  if (!verifyResponse.ok) {
    throw new Error("Payment verification failed.");
  }

  return (await verifyResponse.json()) as {
    verified: boolean;
    demo?: boolean;
  };
}

export default function ParentFees() {
  const { currentUser, students, invoices, updateInvoice, addNotification } = useAppStore();
  const searchParams = useSearchParams();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<(typeof paymentMethods)[number]["id"]>("upi");
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const razorpayPublicKey = useMemo(() => process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "", []);

  const childProfile = useMemo(
    () => students.find((student) => student.parentName === currentUser?.name) ?? students[0],
    [currentUser?.name, students],
  );

  const pendingInvoices = useMemo(() => invoices.filter((invoice) => invoice.status !== "Paid"), [invoices]);

  const invoiceFromQuery = searchParams.get("invoice");

  const selectedInvoice = useMemo(() => {
    return (
      invoices.find((invoice) => invoice.id === invoiceFromQuery) ??
      invoices.find((invoice) => invoice.id === selectedInvoiceId) ??
      pendingInvoices[0] ??
      invoices[0] ??
      null
    );
  }, [invoiceFromQuery, invoices, pendingInvoices, selectedInvoiceId]);

  const totalDue = pendingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  const paymentDetails = {
    name: currentUser?.name ?? childProfile?.parentName ?? "Parent User",
    email: currentUser?.email ?? "parent@example.com",
    contact: currentUser?.phone ?? childProfile?.phone ?? "+91 90000 00000",
  };

  const openCheckout = async (invoice: InvoiceData) => {
    try {
      setProcessing(true);
      setCheckoutStatus("");

      const orderResponse = await createOrder(invoice, paymentReference);

      if (orderResponse.demo) {
        updateInvoice(invoice.id, "Paid");
        addNotification("Demo payment captured", `Invoice ${invoice.id} was marked paid in demo mode.`);
        setCheckoutStatus(`Demo settlement complete for ${invoice.id}.`);
        setProcessing(false);
        return;
      }

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const checkout = new window.Razorpay({
        key: orderResponse.keyId ?? razorpayPublicKey,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: "EduLMS",
        description: `Fee payment for ${invoice.childName}`,
        order_id: orderResponse.order.id,
        prefill: paymentDetails,
        theme: {
          color: "#6d28d9",
        },
        handler: async (paymentResponse) => {
          const verification = await verifyPayment(paymentResponse);
          if (!verification.verified) {
            throw new Error("Payment verification failed.");
          }

          updateInvoice(invoice.id, "Paid");
          addNotification("Payment received", `${invoice.id} has been completed via Razorpay.`);
          setCheckoutStatus(`Payment successful. Receipt ID ${paymentResponse.razorpay_payment_id}.`);
          setProcessing(false);
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      });

      checkout.on("payment.failed", () => {
        addNotification("Payment failed", `Razorpay checkout was closed for ${invoice.id}.`);
        setCheckoutStatus("Payment failed or was dismissed.");
        setProcessing(false);
      });

      checkout.open();
    } catch (error) {
      addNotification("Checkout error", error instanceof Error ? error.message : "Unexpected payment error.");
      setCheckoutStatus(error instanceof Error ? error.message : "Unexpected payment error.");
      setProcessing(false);
    }
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText("edusmart@upi");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Home</span>
          <span>•</span>
          <span>Payments</span>
          <span>•</span>
          <span className="text-foreground">Make payment</span>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">Make payment</h2>
        <p className="max-w-2xl text-muted-foreground">
          Complete outstanding fee invoices with a Razorpay-backed checkout that works for UPI, cards, wallets, and net banking.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-6">
          <Card className="glass-card overflow-hidden rounded-[1.8rem]">
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 px-6 py-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm/6 text-white/70">Fee wallet</p>
                  <h3 className="text-2xl font-semibold tracking-tight">Secure checkout for family payments</h3>
                </div>
                <Badge className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/10">
                  Razorpay enabled
                </Badge>
              </div>
            </div>

            <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">1. Select payment method</p>
                    <p className="text-lg font-semibold">Choose the channel you want to use</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {pendingInvoices.length} pending
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const active = selectedMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={[
                          "flex items-center gap-4 rounded-[1.35rem] border p-4 text-left transition-all",
                          active ? "border-primary/40 bg-primary/5 shadow-md" : "bg-background/80 hover:border-primary/20",
                        ].join(" ")}
                      >
                        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${method.accent}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">{method.title}</span>
                          <span className="block text-sm text-muted-foreground">{method.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-4 rounded-[1.5rem] border bg-background/70 p-5 lg:grid-cols-[1fr_0.9fr]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">2. UPI / QR preview</p>
                      <p className="text-lg font-semibold">Pay using any supported UPI app</p>
                    </div>

                    <div className="flex items-center justify-center rounded-[1.5rem] border bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                      <div className="space-y-4 text-center">
                        <div className="mx-auto grid h-44 w-44 grid-cols-8 gap-1 rounded-[1.25rem] bg-white p-3">
                          {Array.from({ length: 64 }).map((_, index) => (
                            <span
                              key={index}
                              className={[
                                "rounded-[2px]",
                                index % 3 === 0 || index % 5 === 0 ? "bg-slate-900" : "bg-slate-200",
                              ].join(" ")}
                            />
                          ))}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-white/70">Or use UPI ID</p>
                          <button
                            onClick={copyUpi}
                            className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                          >
                            edusmart@upi
                            <Copy className="h-4 w-4" />
                          </button>
                          <p className="text-xs text-white/60">
                            {copied ? "UPI ID copied to clipboard" : "Use any UPI app and scan the QR above"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[1.5rem] border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Payment shortcuts</p>
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Google Pay", tone: "bg-sky-500" },
                        { label: "PhonePe", tone: "bg-violet-500" },
                        { label: "Paytm", tone: "bg-sky-700" },
                        { label: "BHIM", tone: "bg-emerald-500" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 rounded-2xl border bg-background/80 px-4 py-3">
                          <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.5rem] border bg-background/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order summary</p>
                    <p className="text-lg font-semibold">{selectedInvoice?.id ?? "No invoice selected"}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {selectedMethod.toUpperCase()}
                  </Badge>
                </div>

                {selectedInvoice ? (
                  <>
                    <div className="rounded-[1.25rem] border bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Child / bill holder</p>
                          <p className="font-semibold">{selectedInvoice.childName}</p>
                        </div>
                        <Badge className={selectedInvoice.status === "Paid" ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10" : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/10"}>
                          {selectedInvoice.status}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Invoice amount</span>
                          <span className="font-semibold">{formatCurrency(selectedInvoice.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Pending balance</span>
                          <span className="font-semibold">{formatCurrency(totalDue)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Choose invoice</p>
                      <div className="space-y-2">
                        {pendingInvoices.map((invoice) => (
                          <button
                            key={invoice.id}
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                            className={[
                              "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all",
                              selectedInvoice.id === invoice.id ? "border-primary/40 bg-primary/5" : "bg-background/70 hover:border-primary/20",
                            ].join(" ")}
                          >
                            <span>
                              <span className="block font-medium">{invoice.id}</span>
                              <span className="block text-sm text-muted-foreground">{invoice.childName}</span>
                            </span>
                            <span className="text-sm font-semibold">{formatCurrency(invoice.amount)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-[1.25rem] border bg-muted/20 p-4">
                      <label className="text-sm font-medium">Payment note</label>
                      <Input
                        value={paymentReference}
                        onChange={(event) => setPaymentReference(event.target.value)}
                        placeholder="Optional reference for your records"
                      />
                    </div>

                    <Button
                      size="lg"
                      className="h-14 w-full rounded-[1.25rem] text-base font-semibold"
                      disabled={!selectedInvoice || processing}
                      onClick={() => selectedInvoice && openCheckout(selectedInvoice)}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      {processing ? "Opening checkout..." : `Pay ${formatCurrency(selectedInvoice.amount)} securely`}
                    </Button>

                    <div className="space-y-2 text-center">
                      <p className="text-xs text-muted-foreground">
                        By continuing, you agree to our terms and authorize this invoice payment through Razorpay.
                      </p>
                      {checkoutStatus && <p className="text-xs font-medium text-primary">{checkoutStatus}</p>}
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No unpaid invoices are available right now.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-[1.8rem]">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Pending invoices</CardTitle>
                <CardDescription>Tap an invoice below to push it into the checkout flow.</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full">
                {pendingInvoices.length} open
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-[1.3rem] border bg-background/70">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-primary">{invoice.id}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              invoice.status === "Paid"
                                ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10"
                                : invoice.status === "Overdue"
                                ? "bg-rose-500/10 text-rose-700 hover:bg-rose-500/10"
                                : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/10"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.status !== "Paid" ? (
                            <Button
                              size="sm"
                              className="rounded-full"
                              onClick={() => {
                                setSelectedInvoiceId(invoice.id);
                                openCheckout(invoice);
                              }}
                            >
                              Pay now
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-sm text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Paid
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card rounded-[1.8rem]">
            <CardHeader>
              <CardTitle className="text-xl">Your payment details</CardTitle>
              <CardDescription>These details are passed into Razorpay for a faster checkout.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                { label: "Name", value: paymentDetails.name },
                { label: "Email", value: paymentDetails.email },
                { label: "Phone", value: paymentDetails.contact },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border bg-background/70 p-4">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 font-semibold">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card rounded-[1.8rem]">
            <CardHeader>
              <CardTitle className="text-xl">Why this is secure</CardTitle>
              <CardDescription>Payment is processed via Razorpay checkout and server verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "256-bit SSL protected checkout",
                "Server-side order creation",
                "Signature verification before marking paid",
                "Receipts can be shared after settlement",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border bg-background/70 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card rounded-[1.8rem]">
            <CardHeader>
              <CardTitle className="text-xl">Support</CardTitle>
              <CardDescription>Need help before or after paying? We&apos;ve got you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="font-medium">24/7 fee support</p>
                <p className="mt-1 text-sm text-muted-foreground">Reach out if you need a payment receipt or duplicate invoice.</p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="font-medium">Auto reminders</p>
                <p className="mt-1 text-sm text-muted-foreground">Pending invoices are surfaced automatically in the admin console.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
