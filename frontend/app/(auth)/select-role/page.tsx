"use client";

import { useRouter } from "next/navigation";
import { useAppStore, RoleType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Shield, UserCog, User, Users } from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();
  const { login } = useAppStore();

  const handleSelect = (role: RoleType) => {
    login(`${role.toLowerCase()}@edu.com`, role);
    router.push(`/${role.toLowerCase()}/dashboard`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Choose Your Workspace
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select your matching user role to access the relevant layout modules
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Card 
            className="hover:border-primary cursor-pointer transition-all duration-300 transform hover:-translate-y-1 bg-card/60 backdrop-blur-md"
            onClick={() => handleSelect("ADMIN")}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">System Administrator</CardTitle>
                <CardDescription>Manage courses, batches, faculty profiles, and analytics</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="hover:border-primary cursor-pointer transition-all duration-300 transform hover:-translate-y-1 bg-card/60 backdrop-blur-md"
            onClick={() => handleSelect("FACULTY")}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Faculty & Instructors</CardTitle>
                <CardDescription>Conduct live classes, mark attendance, and evaluate assignments</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="hover:border-primary cursor-pointer transition-all duration-300 transform hover:-translate-y-1 bg-card/60 backdrop-blur-md"
            onClick={() => handleSelect("STUDENT")}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Student Profile</CardTitle>
                <CardDescription>Learn modules, track tasks, participate in community discussions</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="hover:border-primary cursor-pointer transition-all duration-300 transform hover:-translate-y-1 bg-card/60 backdrop-blur-md"
            onClick={() => handleSelect("PARENT")}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Parent / Guardian</CardTitle>
                <CardDescription>Monitor child marks, attendance reports, and pay fee invoices</CardDescription>
              </div>
            </CardHeader>
          </Card>

        </div>
      </div>
    </div>
  );
}
