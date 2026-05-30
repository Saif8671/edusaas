"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Sun,
  User,
  UserCog,
  Users,
  UsersRound,
  Video,
  Megaphone,
  BookOpenCheck,
} from "lucide-react";
import { useAppStore, type RoleType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";
import { isDemoMode } from "@/lib/demo";
import { routes } from "@/lib/routes";
import { LoadingShell } from "@/components/app/loading-shell";

type NavItem = {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  hint?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const roleSections: Record<RoleType, NavSection[]> = {
  ADMIN: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, hint: "Control tower" },
        { name: "Batches", href: "/admin/batches", icon: GraduationCap, hint: "Manage cohorts" },
        { name: "Faculty", href: "/admin/faculty", icon: UserCog, hint: "Assign staff" },
        { name: "Students", href: "/admin/students", icon: Users, hint: "Admissions" },
        { name: "Parents", href: "/admin/parents", icon: UsersRound, hint: "Linked guardians" },
      ],
    },
    {
      title: "Operations",
      items: [
        { name: "Courses", href: "/admin/courses", icon: BookOpen, hint: "Catalog" },
        { name: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag, hint: "Sell courses" },
        { name: "Certificates", href: "/admin/certificates", icon: Award, hint: "Issue awards" },
        { name: "Payments", href: "/admin/payments", icon: CreditCard, hint: "Invoices" },
        { name: "Attendance", href: "/admin/attendance", icon: CalendarDays, hint: "Track presence" },
      ],
    },
    {
      title: "Communication",
      items: [
        { name: "Announcements", href: "/admin/announcements", icon: Megaphone, hint: "Broadcast updates" },
        { name: "Settings", href: "/admin/settings", icon: Settings, hint: "System setup" },
      ],
    },
  ],
  FACULTY: [
    {
      title: "Teaching",
      items: [
        { name: "Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard, hint: "Today" },
        { name: "My Courses", href: "/faculty/courses", icon: BookOpen, hint: "Curriculum" },
        { name: "Batches", href: "/faculty/batches", icon: GraduationCap, hint: "Assigned groups" },
        { name: "Students", href: "/faculty/students", icon: Users, hint: "Learner roster" },
        { name: "Assignments", href: "/faculty/assignments", icon: BookOpenCheck, hint: "Review work" },
      ],
    },
    {
      title: "Collaboration",
      items: [
        { name: "Attendance", href: "/faculty/attendance", icon: CalendarDays, hint: "Daily tracking" },
        { name: "Live Classes", href: "/faculty/live", icon: Video, hint: "Meetings" },
        { name: "Messages", href: "/faculty/messages", icon: MessageSquare, hint: "Inbox" },
        { name: "Calendar", href: "/faculty/calendar", icon: CalendarDays, hint: "Reminder plan" },
        { name: "Settings", href: "/faculty/settings", icon: Settings, hint: "Preferences" },
      ],
    },
  ],
  STUDENT: [
    {
      title: "Learning",
      items: [
        { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, hint: "Learning view" },
        { name: "My Courses", href: "/student/courses", icon: BookOpen, hint: "Enrolled classes" },
        { name: "Learning Path", href: "/student/learning-path", icon: Compass, hint: "Roadmap" },
        { name: "AI Study Assistant", href: "/student/ai-study-assistance", icon: Sparkles, hint: "AI tutor" },
        { name: "Marketplace", href: "/student/marketplace", icon: ShoppingBag, hint: "Buy courses" },
        { name: "Assignments", href: "/student/assignments", icon: BookOpenCheck, hint: "To-do" },
      ],
    },
    {
      title: "Progress",
      items: [
        { name: "Attendance", href: "/student/attendance", icon: CalendarDays, hint: "Track presence" },
        { name: "Certificates", href: "/student/certificates", icon: Award, hint: "Completed" },
        { name: "Community", href: "/student/community", icon: UsersRound, hint: "Peer space" },
        { name: "Messages", href: "/student/messages", icon: MessageSquare, hint: "Faculty updates" },
        { name: "Live Classes", href: "/student/live", icon: Video, hint: "Zoom sessions" },
        { name: "Calendar", href: "/student/calendar", icon: CalendarDays, hint: "Upcoming" },
      ],
    },
    {
      title: "Account",
      items: [
        { name: "Profile", href: "/student/profile", icon: User, hint: "Your details" },
        { name: "Settings", href: "/student/settings", icon: Settings, hint: "Preferences" },
      ],
    },
  ],
  PARENT: [
    {
      title: "Family",
      items: [
        { name: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard, hint: "Child overview" },
        { name: "Children", href: "/parent/children", icon: Users, hint: "Linked students" },
        { name: "Performance", href: "/parent/performance", icon: Award, hint: "Progress" },
        { name: "Attendance", href: "/parent/attendance", icon: CalendarDays, hint: "Presence" },
      ],
    },
    {
      title: "Support",
      items: [
        { name: "Fees", href: "/parent/fees", icon: CreditCard, hint: "Payments" },
        { name: "Certificates", href: "/parent/certificates", icon: Award, hint: "Issue list" },
        { name: "Messages", href: "/parent/messages", icon: MessageSquare, hint: "Faculty notes" },
        { name: "Notifications", href: "/parent/notifications", icon: Bell, hint: "Alerts" },
        { name: "Profile", href: "/parent/profile", icon: User, hint: "Contact info" },
        { name: "Settings", href: "/parent/settings", icon: Settings, hint: "Preferences" },
      ],
    },
  ],
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, activeRole, notifications, markAllNotificationsRead, logout } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections = useMemo(() => {
    if (!activeRole) return [];
    return roleSections[activeRole];
  }, [activeRole]);

  const activeItem = useMemo(() => {
    const flatItems = sections.flatMap((section) => section.items);
    return flatItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  }, [pathname, sections]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  if (!mounted || !currentUser || !activeRole) {
    return <LoadingShell label="Preparing your workspace…" />;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const SidebarLinks = () => (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {section.title}
          </div>
          <div className="space-y-1">
            {section.items
              .filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.hint?.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                        isActive ? "border-white/20 bg-white/10" : "border-border bg-background/60",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{item.name}</span>
                      {!collapsed && item.hint && (
                        <span className={cn("block truncate text-[11px]", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {item.hint}
                        </span>
                      )}
                    </span>
                    {!collapsed && isActive && <ArrowRight className="h-4 w-4" />}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="dashboard-shell flex min-h-screen text-foreground">
      <aside
        className={cn(
          "hidden border-r bg-background/75 backdrop-blur-xl md:flex md:flex-col",
          collapsed ? "w-[92px]" : "w-[290px]",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 border-b px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              {collapsed ? "EL" : BRAND_NAME}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="px-4 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search modules..."
              className="h-11 rounded-2xl border-border/60 bg-background/80 pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <SidebarLinks />
        </div>

        <div className="border-t p-4">
          <div className="glass-card flex items-center gap-3 rounded-3xl p-3">
            <Avatar className="h-11 w-11 border border-border/60">
              {currentUser.avatarUrl ? <AvatarImage src={currentUser.avatarUrl} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary">
                {currentUser.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{currentUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
                <Badge variant="outline" className="mt-2 border-primary/20 bg-primary/5 text-primary">
                  {currentUser.role.toLowerCase()}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto p-0">
                  <div className="border-b px-5 py-5">
                    <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
                      {BRAND_NAME}
                    </span>
                  </div>
                  <div className="px-4 py-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search modules..."
                        className="h-11 rounded-2xl pl-9"
                      />
                    </div>
                  </div>
                  <div className="px-3 pb-4">
                    <SidebarLinks />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                  {activeItem?.name ?? "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isDemoMode ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="hidden rounded-full border-dashed px-4 sm:flex">
                      <span className="mr-2 text-xs text-muted-foreground">Demo role</span>
                      <span className="text-xs font-semibold">{activeRole.toLowerCase()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Switch demo workspace</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(["ADMIN", "FACULTY", "STUDENT", "PARENT"] as RoleType[]).map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => {
                          const { login } = useAppStore.getState();
                          login(`${role.toLowerCase()}@edu.com`, role);
                          router.push(routes[role.toLowerCase() as "admin" | "faculty" | "student" | "parent"].dashboard);
                        }}
                      >
                        {role.charAt(0) + role.slice(1).toLowerCase()} view
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between gap-2">
                    <span>Notifications</span>
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={markAllNotificationsRead}
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-2xl px-3 py-2.5 text-sm",
                        item.read ? "text-muted-foreground" : "bg-primary/5 text-foreground",
                      )}
                    >
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs">{item.message}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.time}</p>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden sm:inline-flex"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 rounded-full px-2 sm:px-3">
                    <Avatar className="h-8 w-8">
                      {currentUser.avatarUrl ? <AvatarImage src={currentUser.avatarUrl} /> : null}
                      <AvatarFallback>{currentUser.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 hidden text-left sm:block">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.role.toLowerCase()}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/${activeRole.toLowerCase()}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
