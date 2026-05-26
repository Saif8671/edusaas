"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Recover Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We will email you guidelines to reset your credentials.
          </p>
        </div>

        <Card className="border bg-card/60 backdrop-blur-md shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Forgot Password</CardTitle>
            <CardDescription>Enter registered email address to receive reset email</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {submitted ? (
                <div className="p-4 text-xs bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg">
                  Password reset link sent! Check your email inbox.
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="saif@edu.com"
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {!submitted && (
                <Button type="submit" className="w-full rounded-xl py-6" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Send Reset Link"}
                </Button>
              )}
              
              <Link href="/login" className="flex items-center text-xs font-semibold text-primary hover:underline gap-1">
                <ArrowLeft className="h-3 w-3" />
                Back to Login page
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
