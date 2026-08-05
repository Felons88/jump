import { type ReactNode, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Boxes,
  Calendar as CalendarIcon,
  History,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Settings,
  Sparkles,
  Tag,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminSection =
  | "dashboard"
  | "bookings"
  | "customers"
  | "inventory"
  | "promos"
  | "marketing"
  | "insights"
  | "activity"
  | "routex"
  | "settings";

type NavItem = {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
  badge?: number;
  href?: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarIcon },
  { id: "customers", label: "Customers", icon: Users },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "promos", label: "Promos", icon: Tag },
  { id: "routex", label: "RouteX", icon: Truck, href: "/routex" },
];

const GROWTH_ITEMS: NavItem[] = [
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "insights", label: "AI Insights", icon: Sparkles },
];

const SYSTEM_ITEMS: NavItem[] = [
  { id: "activity", label: "Activity Log", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

const SECTION_TITLES: Record<AdminSection, string> = {
  dashboard: "Dashboard",
  bookings: "Bookings",
  customers: "Customers",
  inventory: "Inventory",
  promos: "Promo Codes",
  marketing: "Marketing",
  insights: "AI Insights",
  activity: "Activity Log",
  routex: "RouteX Delivery",
  settings: "Settings",
};

export function AdminLayout({
  active,
  onNavigate,
  openCount,
  children,
  onOpenCommand,
}: {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
  openCount?: number;
  children: ReactNode;
  onOpenCommand: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar when section changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [active]);

  const navWithBadges = NAV_ITEMS.map((item) =>
    item.id === "bookings" && openCount !== undefined ? { ...item, badge: openCount } : item,
  );

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-black text-primary-foreground">
            JC
          </div>
          <span className="font-display text-sm font-black tracking-tight">Jump City</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-7 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavGroup label="Operations" />
          {navWithBadges.map((item) => (
            <NavButton key={item.id} item={item} active={active} onNavigate={onNavigate} />
          ))}

          <NavGroup label="Growth" />
          {GROWTH_ITEMS.map((item) => (
            <NavButton key={item.id} item={item} active={active} onNavigate={onNavigate} />
          ))}

          <NavGroup label="System" />
          {SYSTEM_ITEMS.map((item) => (
            <NavButton key={item.id} item={item} active={active} onNavigate={onNavigate} />
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 font-display text-xs font-black text-primary">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">Admin</p>
              <p className="truncate text-[10px] text-muted-foreground">admin@jumpcity.com</p>
            </div>
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          {/* Breadcrumb / title */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Admin</span>
            <span className="text-xs text-muted-foreground/40">/</span>
            <h1 className="text-sm font-extrabold">{SECTION_TITLES[active]}</h1>
          </div>

          {/* Command palette trigger */}
          <button
            type="button"
            onClick={onOpenCommand}
            className="ml-auto hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted sm:flex"
          >
            <span>Search or jump to…</span>
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold">
              ⌘K
            </kbd>
          </button>
          <Button variant="ghost" size="icon" className="size-8 sm:hidden" onClick={onOpenCommand}>
            <Package className="size-4" />
          </Button>

          {/* Quick actions */}
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
            <HelpCircle className="size-4" />
          </Button>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

/* ── Sidebar helpers ────────────────────────────────────────────────── */

function NavGroup({ label }: { label: string }) {
  return (
    <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 first:pt-2">
      {label}
    </p>
  );
}

function NavButton({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
}) {
  const isActive = active === item.id;
  const Icon = item.icon;
  const className = cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-colors",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

  const inner = (
    <>
      <Icon className="size-4 shrink-0" />
      {item.label}
      {item.badge !== undefined && item.badge > 0 && (
        <Badge className="ml-auto bg-primary text-primary-foreground">{item.badge}</Badge>
      )}
    </>
  );

  if (item.href) {
    return (
      <Link to={item.href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onNavigate(item.id)} className={className}>
      {inner}
    </button>
  );
}
