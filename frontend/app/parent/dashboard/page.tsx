"use client";

import { useAppStore } from "@/lib/store";
import { 
  Users, CreditCard, Award, Calendar, DollarSign, Wallet,
  TrendingUp, Download, Eye, ShieldAlert, Sparkles, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const marksData = [
  { subject: "Quiz 1", score: 85, average: 74 },
  { subject: "Quiz 2", score: 92, average: 78 },
  { subject: "Midterm", score: 88, average: 75 },
  { subject: "Quiz 3", score: 95, average: 80 },
];

export default function ParentDashboard() {
  const { students, invoices, updateInvoice, addNotification } = useAppStore();

  const childProfile = students.find(s => s.parentName === "A. Rahman") || students[0];
  const pendingInvoices = invoices.filter(inv => inv.status !== "Paid");
  const totalDueAmount = pendingInvoices.reduce((sum, item) => sum + item.amount, 0);

  const handlePay = (id: string) => {
    updateInvoice(id, "Paid");
    addNotification("Payment Received", `Invoice ${id} paid successfully`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Parent Portal Dashboard</h2>
        <p className="text-muted-foreground">Monitor performance scorecards, pay fees, and view children credentials</p>
      </div>

      {/* Children Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Child Profile Card */}
        <Card className="glass-card border bg-card/40 backdrop-blur-md relative overflow-hidden md:col-span-2">
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {childProfile?.status}
            </Badge>
          </div>
          
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-2xl text-primary border border-primary/20">
                {childProfile?.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{childProfile?.name}</CardTitle>
                <CardDescription>Batch: {childProfile?.batch}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid grid-cols-2 gap-4 pt-3 border-t text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs block">Enrolled Specialization</span>
              <span className="font-semibold text-primary">{childProfile?.course}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs block">Average Attendance</span>
              <span className={`font-semibold ${childProfile?.attendancePct >= 75 ? "text-green-500" : "text-red-500"}`}>
                {childProfile?.attendancePct}%
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs block">Syllabus Completion</span>
              <span className="font-semibold">{childProfile?.progress}% Done</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs block">Registered Parent Connection</span>
              <span className="font-semibold">{childProfile?.parentName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Fees Overview Card */}
        <Card className="glass-card border bg-card/40 backdrop-blur-md flex flex-col justify-between">
          <CardHeader>
            <Wallet className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Fees Summary</CardTitle>
            <CardDescription>Outstanding balance terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-primary">${totalDueAmount}.00</div>
            <p className="text-xs text-muted-foreground mt-1">{pendingInvoices.length} Unpaid bills remaining</p>
          </CardContent>
        </Card>

      </div>

      {/* Charts & Invoices List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Child's Performance Chart */}
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Quiz & Midterm Performance Trend</CardTitle>
            <CardDescription>Comparing {childProfile?.name}'s scores to classroom averages</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoices List Table */}
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Pending Bills & Receipts</CardTitle>
            <CardDescription>Verify invoice sheets and complete transaction fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden text-xs">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/40">
                      <TableCell className="font-semibold text-primary">{inv.id}</TableCell>
                      <TableCell className="font-medium">${inv.amount}</TableCell>
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={inv.status === "Paid" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.status !== "Paid" && (
                          <Button size="sm" onClick={() => handlePay(inv.id)} className="rounded-xl text-[10px] py-1 px-2 h-7">
                            Pay Fee
                          </Button>
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

    </div>
  );
}
