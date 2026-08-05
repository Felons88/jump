import { type ReactNode, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  Package,
  Settings,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RouteXNavItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  pattern: string;
};

const NAV_ITEMS: RouteXNavItem[] = [
  { label: "Overview", icon: LayoutDashboard, to: "/routex", pattern: "/routex" },
  { label: "Live Fleet Map", icon: MapIcon, to: "/routex/live-map", pattern: "/routex/live-map" },
  { label: "Routes", icon: Truck, to: "/routex/routes", pattern: "/routex/routes" },
  { label: "Drivers", icon: Users, to: "/routex/drivers", pattern: "/routex/drivers" },
  { label: "Deliveries", icon: Package, to: "/routex/deliveries", pattern: "/routex/deliveries" },
  { label: "Analytics", icon: BarChart3, to: "/routex/analytics", pattern: "/routex/analytics" },
  { label: "Settings", icon: Settings, to: "/routex/settings", pattern: "/routex/settings" },
];

const PAGE_TITLES: Record<string, string> = {
  "/routex": "Command Center",
  "/routex/live-map": "Live Fleet Map",
  "/routex/routes": "Routes & Builder",
  "/routex/drivers": "Driver Roster",
  "/routex/deliveries": "All Deliveries",
  "/routex/analytics": "Analytics & Reports",
  "/routex/settings": "Settings",
};

export function RouteXLayout({
  children,
  onOpenCommand,
}: {
  children?: ReactNode;
  onOpenCommand?: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const currentPath = location.pathname;
  const pageTitle =
    PAGE_TITLES[currentPath] ??
    (currentPath.startsWith("/routex/routes/") ? "Route Detail" : "RouteX");

  const isActive = (item: RouteXNavItem) => {
    if (item.to === "/routex") return currentPath === "/routex";
    return currentPath.startsWith(item.pattern);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-black text-primary-foreground">
            RX
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-black tracking-tight">RouteX</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Fleet Routing
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-7 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Routing
          </p>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Admin
          </p>
          <a
            href="/demo-admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboard className="size-4 shrink-0" />
            Dashboard
          </a>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Demo mode — simulated data
            </span>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">RouteX</span>
            <span className="text-xs text-muted-foreground/40">/</span>
            <h1 className="text-sm font-extrabold">{pageTitle}</h1>
          </div>

          {onOpenCommand && (
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
          )}
        </header>

        <main className="flex-1 overflow-y-auto">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
