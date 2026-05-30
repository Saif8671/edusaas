"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  BellRing,
  CreditCard,
  Download,
  Filter,
  IndianRupee,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildFeeReminderHtml, buildFeeReminderText, deliverNotification } from "@/lib/notifications";

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

export default function AdminPayments() {
  const { currentUser, invoices, updateInvoice, addInvoice, addNotification, students } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<"All" | InvoiceData["status"]>("All");
  const [search, setSearch] = useState("");
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [sendingReminderFor, setSendingReminderFor] = useState<string | null>(null);
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
      email: matchedStudent?.parentEmail ?? matchedStudent?.email ?? "parent@example.com",
      phone: matchedStudent?.parentPhone ?? matchedStudent?.phone ?? "+91 90000 00000",
    };
  };

  const sendFeeReminder = async (invoice: InvoiceData) => {
    const target = getFeeReminderTarget(invoice);

    await deliverNotification({
      toEmail: target.email,
      toPhone: target.phone,
      subject: `Fee reminder for ${target.childName} - ${target.invoiceId}`,
      html: buildFeeReminderHtml(target),
      text: buildFeeReminderText(target),
      whatsappBody: buildFeeReminderText(target),
    });
  };

  const handleSendReminder = async (invoice: InvoiceData) => {
    try {
      setSendingReminderFor(invoice.id);
      await sendFeeReminder(invoice);
      addNotification("Fee reminder sent", `Reminder sent for ${invoice.childName} on ${invoice.id}.`);
    } catch (error) {
      addNotification("Fee reminder failed", error instanceof Error ? error.message : "Unable to send reminder.");
    } finally {
      setSendingReminderFor(null);
    }
  };

  const handleSendAllReminders = async () => {
    try {
      setSendingReminderFor("bulk");
      await Promise.all(pendingInvoices.map((invoice) => sendFeeReminder(invoice)));
      addNotification("Fee reminders dispatched", "Pending and overdue invoices were sent through WhatsApp and email.");
    } catch (error) {
      addNotification("Fee reminder failed", error instanceof Error ? error.message : "Unable to send reminders.");
    } finally {
      setSendingReminderFor(null);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Finance</span>
            <span>•</span>
            <span>Payments</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight">Payments dashboard</h2>
            <p className="max-w-2xl text-muted-foreground">
              Monitor collections, generate invoices, and keep fee reminders moving without leaving the dashboard.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full" onClick={() => addNotification("Payment report exported", "The latest summary is ready for download.")}>
            <Download className="mr-2 h-4 w-4" />
            Export report
          </Button>
          <Button variant="outline" className="rounded-full" onClick={handleSendAllReminders} disabled={sendingReminderFor === "bulk"}>
            <Send className="mr-2 h-4 w-4" />
            {sendingReminderFor === "bulk" ? "Sending..." : "Send reminders"}
          </Button>
          <Button className="rounded-full bg-primary px-5" onClick={openInvoiceDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Generate invoice
          </Button>
        </div>
      </div>

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
                <Button variant="outline" className="rounded-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
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
                                onClick={() => handleSendReminder(invoice)}
                                disabled={sendingReminderFor === invoice.id}
                              >
                                <Send className="mr-2 h-3.5 w-3.5" />
                                {sendingReminderFor === invoice.id ? "Sending..." : "Remind"}
                              </Button>
                              <Button size="sm" className="rounded-full" onClick={() => handleMarkPaid(invoice)}>
                                <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                                Mark paid
                              </Button>
                            </>
                          )}
                          {invoice.status === "Paid" && (
                            <Button variant="outline" size="sm" className="rounded-full">
                              <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
                              View receipt
                            </Button>
                          )}
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

          <Card className="glass-card rounded-[1.8rem]">
            <CardHeader>
              <CardTitle className="text-xl">Quick actions</CardTitle>
              <CardDescription>Common finance tasks inspired by the sample layout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "Generate invoice",
                  description: "Create a new student billing entry.",
                  onClick: openInvoiceDialog,
                },
                {
                  title: "Send fee reminder",
                  description: "Ping pending and overdue invoices.",
                  onClick: handleSendAllReminders,
                },
                {
                  title: "Download receipt bundle",
                  description: "Collect payment history for auditing.",
                  onClick: () => addNotification("Receipt bundle prepared", "A PDF export stub has been prepared in this demo."),
                },
              ].map((action) => (
                <button
                  key={action.title}
                  onClick={action.onClick}
                  className="flex w-full items-center gap-4 rounded-[1.2rem] border bg-background/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Plus className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

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
