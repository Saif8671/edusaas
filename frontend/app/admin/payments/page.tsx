"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  BellRing,
  CreditCard,
  Download,
  Filter,
  IndianRupee,
  Plus,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useAppStore, type InvoiceData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildFeeReminderText, deliverWhatsAppNotification } from "@/lib/notifications";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const PIE_COLORS = {
  Paid: "#22c55e",
  Pending: "#f59e0b",
  Overdue: "#ef4444",
} as const;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const paymentMethodLabel = (status: InvoiceData["status"]) => {
  if (status === "Paid") return "Razorpay UPI";
  if (status === "Overdue") return "Razorpay Link";
  return "Online Checkout";
};

type InvoicePreview = {
  invoiceId: string;
  receiptId: string;
  childName: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentMethod: string;
  paidAt: string;
  fileName: string;
  html: string;
  text: string;
};

function PaymentQuickAction({
  title,
  description,
  icon: Icon,
  tone,
  badge,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  icon: typeof Plus;
  tone: string;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[132px] min-w-0 flex-col justify-between overflow-hidden rounded-[1.35rem] border bg-background/70 p-4 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", tone)}>
          <Icon className="h-5 w-5" />
        </span>
        {badge ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-4">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 scale-x-0 bg-primary/70 transition-transform group-hover:scale-x-100" />
    </button>
  );
}

export default function AdminPayments() {
  const { currentUser, invoices, updateInvoice, addInvoice, addNotification, students } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<"All" | InvoiceData["status"]>("All");
  const [search, setSearch] = useState("");
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [sendingReminderFor, setSendingReminderFor] = useState<string | null>(null);
  const [viewingReceiptFor, setViewingReceiptFor] = useState<string | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<InvoicePreview | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    childName: "",
    amount: "",
    dueDate: "",
  });

  const stats = useMemo(() => {
    const paid = invoices.filter((invoice) => invoice.status === "Paid");
    const pending = invoices.filter((invoice) => invoice.status === "Pending");
    const overdue = invoices.filter((invoice) => invoice.status === "Overdue");

    return {
      totalCollected: paid.reduce((sum, invoice) => sum + invoice.amount, 0),
      totalPending: pending.reduce((sum, invoice) => sum + invoice.amount, 0),
      totalOverdue: overdue.reduce((sum, invoice) => sum + invoice.amount, 0),
      totalTransactions: invoices.length,
      chartData: [
        { name: "Paid", value: paid.reduce((sum, invoice) => sum + invoice.amount, 0) },
        { name: "Pending", value: pending.reduce((sum, invoice) => sum + invoice.amount, 0) },
        { name: "Overdue", value: overdue.reduce((sum, invoice) => sum + invoice.amount, 0) },
      ].filter((item) => item.value > 0),
    };
  }, [invoices]);

  const visibleInvoices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesStatus = statusFilter === "All" ? true : invoice.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        invoice.id.toLowerCase().includes(normalizedSearch) ||
        invoice.childName.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [invoices, search, statusFilter]);

  const pendingInvoices = useMemo(() => invoices.filter((invoice) => invoice.status !== "Paid"), [invoices]);

  const openInvoiceDialog = () => {
    setNewInvoice({
      childName: "",
      amount: "",
      dueDate: "",
    });
    setInvoiceDialogOpen(true);
  };

  const handleGenerateInvoice = () => {
    const amount = Number.parseFloat(newInvoice.amount);
    if (!newInvoice.childName.trim() || Number.isNaN(amount) || amount <= 0 || !newInvoice.dueDate) {
      return;
    }

    addInvoice({
      childName: newInvoice.childName.trim(),
      amount,
      dueDate: newInvoice.dueDate,
      status: "Pending",
    });
    addNotification("Invoice generated", `Invoice created for ${newInvoice.childName.trim()} at ${formatCurrency(amount)}.`);
    setInvoiceDialogOpen(false);
  };

  const handleMarkPaid = (invoice: InvoiceData) => {
    updateInvoice(invoice.id, "Paid");
    addNotification("Payment settled", `${invoice.id} was marked as paid.`);
  };

  const getFeeReminderTarget = (invoice: InvoiceData) => {
    const matchedStudent =
      students.find((student) => student.name === invoice.childName) ?? 
      students.find((student) => student.parentName === currentUser?.name) ?? 
      students[0] ?? 
      null;

    return {
      childName: invoice.childName,
      invoiceId: invoice.id,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      phone: matchedStudent?.parentPhone ?? matchedStudent?.phone ?? "+91 90000 00000",
    };
  };

  const sendFeeReminder = async (invoice: InvoiceData) => {
    const target = getFeeReminderTarget(invoice);
    const body = buildFeeReminderText(target);

    await deliverWhatsAppNotification({
      toPhone: target.phone,
      body,
    });
  };

  const handleSendReminder = async (invoice: InvoiceData) => {
    try {
      setSendingReminderFor(invoice.id);
      await sendFeeReminder(invoice);
      addNotification("WhatsApp reminder sent", `Fee reminder for ${invoice.childName} (${invoice.id}) was queued on WhatsApp.`);
      toast.success(`WhatsApp reminder sent to ${invoice.childName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send WhatsApp reminder.";
      addNotification("WhatsApp reminder failed", message);
      toast.error(message);
    } finally {
      setSendingReminderFor(null);
    }
  };

  const handleSendAllReminders = async () => {
    if (pendingInvoices.length === 0) {
      toast.info("No pending or overdue invoices to remind.");
      return;
    }

    try {
      setSendingReminderFor("bulk");
      await Promise.all(pendingInvoices.map((invoice) => sendFeeReminder(invoice)));
      addNotification("WhatsApp reminders dispatched", `${pendingInvoices.length} fee reminders were sent via WhatsApp.`);
      toast.success(`${pendingInvoices.length} WhatsApp reminders sent`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send WhatsApp reminders.";
      addNotification("WhatsApp reminder failed", message);
      toast.error(message);
    } finally {
      setSendingReminderFor(null);
    }
  };

  const exportPaymentReport = () => {
    downloadReceiptBundle();
  };

  const downloadReceiptFile = (payload: { fileName: string; html: string; text: string; contentType?: string }) => {
    const blob = new Blob([payload.html || payload.text], { type: payload.contentType ?? "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = payload.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadReceiptBundle = () => {
    const csvRows = [
      ["Invoice ID", "Student", "Amount", "Due Date", "Status"],
      ...invoices.map((invoice) => [
        invoice.id,
        invoice.childName,
        invoice.amount.toString(),
        invoice.dueDate,
        invoice.status,
      ]),
    ];
    const csv = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "payment-receipt-bundle.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    addNotification("Receipt bundle downloaded", "A CSV export of the invoice ledger has been generated.");
    toast.success("Receipt bundle downloaded");
  };

  const handleViewReceipt = async (invoice: InvoiceData) => {
    try {
      setViewingReceiptFor(invoice.id);
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          childName: invoice.childName,
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          status: invoice.status,
          paymentMethod: invoice.status === "Paid" ? "Razorpay UPI" : "Online Checkout",
          paidAt: invoice.status === "Paid" ? new Date().toISOString() : undefined,
          description: "Tuition & course fee",
          courseName: "Academic Program",
        }),
      });

      const data = (await response.json()) as { invoice?: InvoicePreview; error?: string };
      if (!response.ok || !data.invoice) {
        throw new Error(data.error || "Unable to generate invoice.");
      }

      setReceiptPreview(data.invoice);
      setReceiptDialogOpen(true);
      addNotification("Invoice ready", `${invoice.id} is ready to preview and download.`);
      toast.success(invoice.status === "Paid" ? "Receipt generated" : "Invoice generated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate invoice.";
      addNotification("Invoice failed", message);
      toast.error(message);
    } finally {
      setViewingReceiptFor(null);
    }
  };

  const statusBadge = (status: InvoiceData["status"]) => {
    if (status === "Paid") {
      return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">Paid</Badge>;
    }

    if (status === "Pending") {
      return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">Pending</Badge>;
    }

    return <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/10">Overdue</Badge>;
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Payments dashboard"
        description="Monitor collections, generate invoices, and keep fee reminders moving without leaving the dashboard."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full" onClick={exportPaymentReport}>
              <Download className="mr-2 h-4 w-4" />
              Export report
            </Button>
            <Button variant="outline" className="rounded-full" onClick={handleSendAllReminders} disabled={sendingReminderFor === "bulk"}>
              <Send className="mr-2 h-4 w-4" />
              {sendingReminderFor === "bulk" ? "Sending..." : "Send WhatsApp reminders"}
            </Button>
            <Button className="rounded-full bg-primary px-5" onClick={openInvoiceDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Generate invoice
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total collected",
            value: formatCurrency(stats.totalCollected),
            detail: `${invoices.filter((invoice) => invoice.status === "Paid").length} successful payments`,
            icon: Banknote,
            tone: "text-emerald-600",
          },
          {
            title: "Pending dues",
            value: formatCurrency(stats.totalPending),
            detail: `${invoices.filter((invoice) => invoice.status === "Pending").length} invoices awaiting checkout`,
            icon: CreditCard,
            tone: "text-amber-500",
          },
          {
            title: "Overdue balance",
            value: formatCurrency(stats.totalOverdue),
            detail: `${invoices.filter((invoice) => invoice.status === "Overdue").length} invoices need follow-up`,
            icon: BellRing,
            tone: "text-rose-500",
          },
          {
            title: "Transactions",
            value: String(stats.totalTransactions),
            detail: "Ledger entries tracked in this demo",
            icon: IndianRupee,
            tone: "text-sky-500",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="glass-card rounded-[1.6rem]">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="mt-2 text-3xl tracking-tight">{stat.value}</CardTitle>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/60 ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardHeader>
              <CardContent className="pb-5">
                <p className="text-sm text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card overflow-hidden rounded-[1.8rem]">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5 pb-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Zap className="h-3.5 w-3.5" />
                Finance quick actions
              </div>
              <CardTitle className="text-xl">Run billing workflows in one click</CardTitle>
              <CardDescription className="max-w-2xl">
                Generate invoices, chase pending fees, export receipts, and jump straight to the records that need attention.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border bg-background/70 px-3 py-1">{pendingInvoices.length} open invoices</span>
              <span className="rounded-full border bg-background/70 px-3 py-1">{formatCurrency(stats.totalPending + stats.totalOverdue)} outstanding</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <PaymentQuickAction
            title="Generate invoice"
            description="Create a new student billing entry with due date and amount."
            icon={Plus}
            tone="bg-primary/12 text-primary"
            onClick={openInvoiceDialog}
          />
          <PaymentQuickAction
            title="WhatsApp reminders"
            description="Send fee reminders for every pending or overdue invoice."
            icon={BellRing}
            tone="bg-amber-500/12 text-amber-600"
            badge={pendingInvoices.length > 0 ? `${pendingInvoices.length} due` : undefined}
            disabled={sendingReminderFor === "bulk"}
            onClick={() => void handleSendAllReminders()}
          />
          <PaymentQuickAction
            title="Download receipt bundle"
            description="Export the full payment ledger as a CSV audit file."
            icon={Download}
            tone="bg-emerald-500/12 text-emerald-600"
            onClick={downloadReceiptBundle}
          />
          <PaymentQuickAction
            title="Review pending dues"
            description="Filter the invoice table to unpaid records that need follow-up."
            icon={Receipt}
            tone="bg-sky-500/12 text-sky-600"
            badge={invoices.filter((invoice) => invoice.status === "Pending").length > 0 ? "Pending" : undefined}
            onClick={() => {
              setStatusFilter("Pending");
              toast.info("Showing pending invoices");
            }}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="glass-card rounded-[1.8rem]">
          <CardHeader className="gap-4 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl">Invoice registry</CardTitle>
                <CardDescription>Search by student or invoice ID, then settle or chase payments from one place.</CardDescription>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by invoice or student"
                    className="h-11 rounded-full pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setStatusFilter("Pending");
                    toast.info("Showing pending invoices");
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Pending only
                </Button>
              </div>
            </div>

            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)} className="mt-2">
              <TabsList className="grid h-auto w-full max-w-2xl grid-cols-4 rounded-full bg-muted/50 p-1">
                <TabsTrigger value="All" className="rounded-full">
                  All payments
                </TabsTrigger>
                <TabsTrigger value="Pending" className="rounded-full">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="Paid" className="rounded-full">
                  Paid
                </TabsTrigger>
                <TabsTrigger value="Overdue" className="rounded-full">
                  Overdue
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-[1.4rem] border bg-background/70">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{invoice.id}</p>
                          <p className="text-xs text-muted-foreground">Parent ledger entry</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{invoice.childName}</p>
                          <p className="text-xs text-muted-foreground">Razorpay checkout ready</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{statusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Smartphone className="h-4 w-4" />
                          {paymentMethodLabel(invoice.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {invoice.status !== "Paid" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => void handleSendReminder(invoice)}
                                disabled={sendingReminderFor === invoice.id}
                              >
                                <Smartphone className="mr-2 h-3.5 w-3.5" />
                                {sendingReminderFor === invoice.id ? "Sending..." : "WhatsApp"}
                              </Button>
                              <Button size="sm" className="rounded-full" onClick={() => handleMarkPaid(invoice)}>
                                <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                                Mark paid
                              </Button>
                            </>
                          )}
                          <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => void handleViewReceipt(invoice)}
                              disabled={viewingReceiptFor === invoice.id}
                            >
                              <Download className="mr-2 h-3.5 w-3.5" />
                              {viewingReceiptFor === invoice.id ? "Generating..." : invoice.status === "Paid" ? "View receipt" : "Download invoice"}
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between rounded-[1.2rem] border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <span>
                Showing {visibleInvoices.length} of {invoices.length} invoices
              </span>
              <span>Razorpay-ready invoice workflow</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card rounded-[1.8rem]">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Payment overview</CardTitle>
                <CardDescription>Collection mix for the current ledger.</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full">
                This month
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="h-60 rounded-[1.4rem] border bg-background/70 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {stats.chartData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 16, borderColor: "hsl(var(--border))", background: "hsl(var(--background))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Paid", amount: stats.chartData.find((item) => item.name === "Paid")?.value ?? 0, tone: "bg-emerald-500" },
                  { label: "Pending", amount: stats.chartData.find((item) => item.name === "Pending")?.value ?? 0, tone: "bg-amber-500" },
                  { label: "Overdue", amount: stats.chartData.find((item) => item.name === "Overdue")?.value ?? 0, tone: "bg-rose-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border bg-background/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice preview</DialogTitle>
            <DialogDescription>
              A downloadable tax invoice has been generated. Preview it below or download again.
            </DialogDescription>
          </DialogHeader>

          {receiptPreview ? (
            <div className="grid gap-4 py-2">
              <div className="overflow-hidden rounded-2xl border bg-background">
                <iframe
                  title="Invoice preview"
                  srcDoc={receiptPreview.html}
                  className="h-[420px] w-full border-0"
                  sandbox=""
                />
              </div>
              <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-medium">{receiptPreview.invoiceId}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Receipt</span>
                    <span className="font-medium">{receiptPreview.receiptId}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Student</span>
                    <span className="font-medium">{receiptPreview.childName}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{formatCurrency(receiptPreview.amount)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">{receiptPreview.status}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">File</span>
                    <span className="font-medium">{receiptPreview.fileName}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Close
            </Button>
            {receiptPreview ? (
              <Button onClick={() => downloadReceiptFile(receiptPreview)}>
                <Download className="mr-2 h-4 w-4" />
                Download invoice
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create invoice</DialogTitle>
            <DialogDescription>Capture the minimum details needed to generate a payment request.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Student or parent name</label>
              <Input
                value={newInvoice.childName}
                onChange={(event) => setNewInvoice((current) => ({ ...current, childName: event.target.value }))}
                placeholder="A. Rahman"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  min="1"
                  value={newInvoice.amount}
                  onChange={(event) => setNewInvoice((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="499"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due date</label>
                <Input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(event) => setNewInvoice((current) => ({ ...current, dueDate: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateInvoice}>Generate invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
