import { useMemo, useState } from "react";
import { isAfter, subDays } from "date-fns";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar as CalendarIcon, DollarSign, Package, TrendingUp, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/data/mockBookings";
import { revenueBookings, useAdminState } from "@/data/adminStore";
import type { AdminBooking, AdminCustomer } from "@/data/adminTypes";

import { AdminLayout, type AdminSection } from "@/components/admin/AdminLayout";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { BookingDetailDrawer } from "@/components/admin/BookingDetailDrawer";
import { CustomerDetailDrawer } from "@/components/admin/CustomerDetailDrawer";
import {
  DateRangeSelector,
  type DateRangeKey,
  EmptyState,
  KpiCard,
} from "@/components/admin/AdminPrimitives";
import { DashboardSection } from "@/components/admin/sections/DashboardSection";
import { BookingsSection } from "@/components/admin/sections/BookingsSection";
import { CustomersSection } from "@/components/admin/sections/CustomersSection";
import { InventorySection } from "@/components/admin/sections/InventorySection";
import { PromosSection } from "@/components/admin/sections/PromosSection";
import { MarketingSection } from "@/components/admin/sections/MarketingSection";
import { InsightsSection } from "@/components/admin/sections/InsightsSection";
import { ActivitySection } from "@/components/admin/sections/ActivitySection";
import { SettingsSection } from "@/components/admin/sections/SettingsSection";

export const Route = createFileRoute("/demo-admin")({
  component: AdminDashboard,
});

/** Sections that get the shared date-range + KPI header. */
const SECTIONS_WITH_KPIS: AdminSection[] = ["bookings", "customers"];

function AdminDashboard() {
  const { bookings, customers, inventory } = useAdminState();

  const [section, setSection] = useState<AdminSection>("dashboard");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeKey>("30d");

  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

  const filteredByDate = useMemo(() => {
    if (dateRange === "all") return bookings;
    const now = new Date();
    const cutoff =
      dateRange === "today"
        ? subDays(now, 1)
        : dateRange === "7d"
          ? subDays(now, 7)
          : subDays(now, 30);
    return bookings.filter((b) => isAfter(b.eventDate, cutoff));
  }, [bookings, dateRange]);

  const openCount = bookings.filter((b) => b.status === "open").length;
  const periodRevenue = revenueBookings(filteredByDate).reduce((s, b) => s + b.total, 0);

  /* Keep the drawers bound to live store data rather than a stale snapshot, so
     edits made inside a drawer are reflected immediately. */
  const liveBooking = selectedBooking
    ? (bookings.find((b) => b.id === selectedBooking.id) ?? null)
    : null;
  const liveCustomer = selectedCustomer
    ? (customers.find((c) => c.id === selectedCustomer.id) ?? null)
    : null;

  const openBookingById = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    setSelectedBooking(booking);
    setBookingDrawerOpen(true);
  };

  const openBooking = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setBookingDrawerOpen(true);
  };

  const openCustomer = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setCustomerDrawerOpen(true);
  };

  return (
    <AdminLayout
      active={section}
      onNavigate={setSection}
      openCount={openCount}
      onOpenCommand={() => setCmdOpen(true)}
    >
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} onNavigate={setSection} />

      <BookingDetailDrawer
        booking={liveBooking}
        open={bookingDrawerOpen}
        onOpenChange={setBookingDrawerOpen}
      />
      <CustomerDetailDrawer
        customer={liveCustomer}
        open={customerDrawerOpen}
        onOpenChange={setCustomerDrawerOpen}
      />

      {SECTIONS_WITH_KPIS.includes(section) && (
        <div className="space-y-4">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Revenue" value={formatMoney(periodRevenue)} icon={DollarSign} />
            <KpiCard label="Bookings" value={String(filteredByDate.length)} icon={CalendarIcon} />
            <KpiCard label="Open requests" value={String(openCount)} icon={Package} />
            <KpiCard label="Customers" value={String(customers.length)} icon={Users} />
          </div>
        </div>
      )}

      <div className={SECTIONS_WITH_KPIS.includes(section) ? "mt-6" : ""}>
        {section === "dashboard" && (
          <DashboardSection onNavigate={setSection} onOpenBooking={openBookingById} />
        )}
        {section === "bookings" && (
          <BookingsSection bookings={filteredByDate} onRowClick={openBooking} />
        )}
        {section === "customers" && <CustomersSection onRowClick={openCustomer} />}
        {section === "inventory" && <InventorySection />}
        {section === "promos" && <PromosSection />}
        {section === "marketing" && <MarketingSection />}
        {section === "insights" && <InsightsSection />}
        {section === "activity" && <ActivitySection />}
        {section === "settings" && <SettingsSection />}
        {section === "routex" && (
          <EmptyState
            icon={TrendingUp}
            title="RouteX Delivery Optimization"
            description={`Plan routes for ${inventory.length} units across today's deliveries.`}
            action={
              <Button asChild>
                <a href="/routex">Open RouteX</a>
              </Button>
            }
          />
        )}
      </div>
    </AdminLayout>
  );
}
