"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, RoleType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { BRAND_NAME, BRAND_LOGIN_SUBTITLE } from "@/lib/brand";
import { isDemoMode } from "@/lib/demo";
import { routes } from "@/lib/routes";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    
    // Automatically match role simulation by email name
    setTimeout(() => {
      let detectedRole: RoleType = "STUDENT";
      const normalized = email.toLowerCase();
      if (normalized.includes("admin")) detectedRole = "ADMIN";
      else if (normalized.includes("faculty") || normalized.includes("teacher") || normalized.includes("albert")) detectedRole = "FACULTY";
      else if (normalized.includes("parent") || normalized.includes("rahman")) detectedRole = "PARENT";
      
      login(email, detectedRole);
      toast.success(`Signed in as ${detectedRole.toLowerCase()}`);
      router.push(routes[detectedRole.toLowerCase() as "admin" | "faculty" | "student" | "parent"].dashboard);
      setLoading(false);
    }, 1000);
  };

  const handleQuickLogin = (role: RoleType) => {
    setLoading(true);
    setTimeout(() => {
      login(`${role.toLowerCase()}@edu.com`, role);
      router.push(routes[role.toLowerCase() as "admin" | "faculty" | "student" | "parent"].dashboard);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8">
        
        {/* Title / Logo Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            {BRAND_NAME}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{BRAND_LOGIN_SUBTITLE}</p>
          {isDemoMode ? (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Demo mode — any password works</p>
          ) : null}
        </div>

        {/* Credentials Form */}
        <Card className="border bg-card/60 backdrop-blur-md shadow-xl rounded-2xl glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Enter your credential details to log in</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@edu.com, student@edu.com..."
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-xs font-medium text-muted-foreground">
                  Remember me on this computer
                </label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full rounded-xl py-6" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Sign In"}
              </Button>

              <div className="text-xs text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Create one now
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {isDemoMode ? (
        <div className="space-y-3">
          <div className="my-4 flex items-center">
            <div className="grow border-t" />
            <span className="mx-4 text-xs font-bold uppercase text-muted-foreground">Quick demo access</span>
            <div className="grow border-t" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("ADMIN")} className="hover:border-primary">
              Admin Portal
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("FACULTY")} className="hover:border-primary">
              Faculty Portal
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("STUDENT")} className="hover:border-primary">
              Student Portal
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("PARENT")} className="hover:border-primary">
              Parent Portal
            </Button>
          </div>
        </div>
        ) : null}

      </div>
    </div>
  );
}
