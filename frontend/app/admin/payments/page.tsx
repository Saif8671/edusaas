"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, DollarSign, Wallet, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPayments() {
  const { invoices, updateInvoice } = useAppStore();

  const handlePay = (id: string) => {
    updateInvoice(id, "Paid");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Paid</Badge>;
      case "Pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case "Overdue":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Overdue</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments & Invoices</h2>
          <p className="text-muted-foreground">Monitor collections, generate student billing invoices, and track outstanding fees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold">Total Collected</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$299.00</div>
            <p className="text-xs text-muted-foreground mt-1">1 Paid Invoice</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold">Total Outstanding</CardTitle>
            <Wallet className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$649.00</div>
            <p className="text-xs text-muted-foreground mt-1">2 Unpaid/Overdue</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Billing Invoices</CardTitle>
          <CardDescription>Direct interface to view collections and edit payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-primary">{inv.id}</TableCell>
                    <TableCell className="font-medium">{inv.childName}</TableCell>
                    <TableCell>${inv.amount}</TableCell>
                    <TableCell>{inv.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="text-right">
                      {inv.status !== "Paid" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl text-xs"
                          onClick={() => handlePay(inv.id)}
                        >
                          Mark Paid
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
  );
}
