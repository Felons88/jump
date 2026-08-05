import { useEffect } from "react";
import { format } from "date-fns";
import {
  Boxes,
  Calendar as CalendarIcon,
  Download,
  History,
  LayoutDashboard,
  Megaphone,
  Settings,
  Sparkles,
  Tag,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { adminStore, customerMetrics } from "@/data/adminStore";
import type { AdminSection } from "@/components/admin/AdminLayout";

type CommandAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  section?: AdminSection;
  href?: string;
  description?: string;
};

const NAV_COMMANDS: CommandAction[] = [
  {
    id: "go-dashboard",
    label: "Go to Dashboard",
    icon: LayoutDashboard,
    section: "dashboard",
    shortcut: "G D",
  },
  {
    id: "go-bookings",
    label: "Go to Bookings",
    icon: CalendarIcon,
    section: "bookings",
    shortcut: "G B",
  },
  {
    id: "go-customers",
    label: "Go to Customers",
    icon: Users,
    section: "customers",
    shortcut: "G C",
  },
  {
    id: "go-inventory",
    label: "Go to Inventory",
    icon: Boxes,
    section: "inventory",
    shortcut: "G I",
  },
  { id: "go-promos", label: "Go to Promo Codes", icon: Tag, section: "promos", shortcut: "G P" },
  {
    id: "go-marketing",
    label: "Go to Marketing",
    icon: Megaphone,
    section: "marketing",
    shortcut: "G M",
  },
  {
    id: "go-insights",
    label: "Go to AI Insights",
    icon: Sparkles,
    section: "insights",
    shortcut: "G A",
  },
  {
    id: "go-activity",
    label: "Go to Activity Log",
    icon: History,
    section: "activity",
    shortcut: "G L",
  },
  { id: "go-routex", label: "Go to RouteX", icon: Truck, section: "routex", shortcut: "G R" },
  {
    id: "go-settings",
    label: "Go to Settings",
    icon: Settings,
    section: "settings",
    shortcut: "G S",
  },
];

/* ── CSV export ─────────────────────────────────────────────────────── */

function escapeCsv(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportBookings(): void {
  const { bookings, customers } = adminStore.getState();
  const byId = new Map(customers.map((c) => [c.id, c]));
  downloadCsv(
    `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`,
    [
      "Booking ID",
      "Customer",
      "Email",
      "Phone",
      "Item",
      "Event Date",
      "Delivery Window",
      "Street",
      "City",
      "State",
      "ZIP",
      "Subtotal",
      "Delivery",
      "Discount",
      "Promo",
      "Tax",
      "Total",
      "Deposit",
      "Balance",
      "Status",
      "Payment",
    ],
    bookings.map((b) => {
      const c = byId.get(b.customerId);
      return [
        b.id,
        c?.name ?? "",
        c?.email ?? "",
        c?.phone ?? "",
        b.item.name,
        format(b.eventDate, "yyyy-MM-dd"),
        b.deliveryWindow,
        b.address.street,
        b.address.city,
        b.address.state,
        b.address.zip,
        b.subtotal,
        b.deliveryFee,
        b.discount,
        b.promoCode ?? "",
        b.tax,
        b.total,
        b.deposit,
        b.balance,
        b.status,
        b.paymentStatus,
      ];
    }),
  );
  toast.success(`Exported ${bookings.length} bookings`);
}

function exportCustomers(): void {
  const { customers, bookings } = adminStore.getState();
  downloadCsv(
    `customers-${format(new Date(), "yyyy-MM-dd")}.csv`,
    [
      "Customer ID",
      "Name",
      "Email",
      "Phone",
      "Joined",
      "Newsletter",
      "Tags",
      "Bookings",
      "Lifetime Value",
      "Avg Order",
      "Last Booking",
      "Days Quiet",
    ],
    customers.map((c) => {
      const m = customerMetrics(c.id, bookings);
      return [
        c.id,
        c.name,
        c.email,
        c.phone,
        format(c.createdAt, "yyyy-MM-dd"),
        c.newsletterOptIn ? "yes" : "no",
        c.tags.join("|"),
        m.bookingCount,
        m.lifetimeValue.toFixed(2),
        m.averageOrderValue.toFixed(2),
        m.lastBookingDate ? format(m.lastBookingDate, "yyyy-MM-dd") : "",
        m.daysSinceLastBooking ?? "",
      ];
    }),
  );
  toast.success(`Exported ${customers.length} customers`);
}

function exportInventory(): void {
  const { inventory } = adminStore.getState();
  downloadCsv(
    `inventory-${format(new Date(), "yyyy-MM-dd")}.csv`,
    [
      "ID",
      "Name",
      "Category",
      "Status",
      "Condition",
      "Times Rented",
      "Rental Price",
      "Purchase Price",
      "Revenue (est)",
      "Maintenance Cost",
      "Notes",
    ],
    inventory.map((i) => [
      i.id,
      i.name,
      i.categorySlug,
      i.status,
      i.condition,
      i.timesRented,
      i.priceFrom,
      i.purchasePrice,
      i.timesRented * i.priceFrom,
      i.maintenance.reduce((s, m) => s + m.cost, 0),
      i.notes,
    ]),
  );
  toast.success(`Exported ${inventory.length} inventory items`);
}

const QUICK_COMMANDS: (CommandAction & { run: () => void })[] = [
  {
    id: "export-bookings",
    label: "Export Bookings (CSV)",
    icon: Download,
    description: "Download every booking with customer and payment detail",
    run: exportBookings,
  },
  {
    id: "export-customers",
    label: "Export Customers (CSV)",
    icon: Download,
    description: "Download the customer list with lifetime value",
    run: exportCustomers,
  },
  {
    id: "export-inventory",
    label: "Export Inventory (CSV)",
    icon: Download,
    description: "Download fleet status and utilization",
    run: exportInventory,
  },
];

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (section: AdminSection) => void;
}) {
  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const handleSelect = (action: CommandAction) => {
    onOpenChange(false);
    if (action.section) onNavigate(action.section);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandEmpty>No results found.</CommandEmpty>

      <CommandGroup heading="Navigation">
        {NAV_COMMANDS.map((cmd) => {
          const Icon = cmd.icon;
          return (
            <CommandItem key={cmd.id} onSelect={() => handleSelect(cmd)}>
              <Icon className="size-4" />
              <span>{cmd.label}</span>
              {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
            </CommandItem>
          );
        })}
      </CommandGroup>

      <CommandGroup heading="Quick Actions">
        {QUICK_COMMANDS.map((cmd) => {
          const Icon = cmd.icon;
          return (
            <CommandItem
              key={cmd.id}
              onSelect={() => {
                onOpenChange(false);
                cmd.run();
              }}
            >
              <Icon className="size-4" />
              <div className="flex flex-col">
                <span>{cmd.label}</span>
                {cmd.description && (
                  <span className="text-xs text-muted-foreground">{cmd.description}</span>
                )}
              </div>
            </CommandItem>
          );
        })}
      </CommandGroup>
    </CommandDialog>
  );
}
