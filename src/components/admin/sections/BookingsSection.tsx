import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMoney } from "@/data/mockBookings";
import { bookingActions, useAdminState } from "@/data/adminStore";
import type { AdminBooking, AdminBookingStatus } from "@/data/adminTypes";
import {
  DataTable,
  EmptyState,
  FilterChips,
  StatusBadge,
  TableSearch,
  type Column,
} from "@/components/admin/AdminPrimitives";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmailComposer } from "@/components/admin/EmailComposer";

type BookingFilter = "all" | AdminBookingStatus;

export function BookingsSection({
  bookings,
  onRowClick,
  loading = false,
}: {
  bookings: AdminBooking[];
  onRowClick: (b: AdminBooking) => void;
  loading?: boolean;
}) {
  const { customers } = useAdminState();
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);

  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const filtered = useMemo(() => {
    let result = bookings;
    if (filter !== "all") result = result.filter((b) => b.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) => {
        const customer = customerById.get(b.customerId);
        return (
          b.item.name.toLowerCase().includes(q) ||
          b.address.city.toLowerCase().includes(q) ||
          b.address.street.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          (customer?.name.toLowerCase().includes(q) ?? false) ||
          (customer?.email.toLowerCase().includes(q) ?? false)
        );
      });
    }
    return result;
  }, [bookings, filter, search, customerById]);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      open: bookings.filter((b) => b.status === "open").length,
      sent: bookings.filter((b) => b.status === "sent").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings],
  );

  const selectedBookings = bookings.filter((b) => selected.has(b.id));
  const selectedCustomers = [
    ...new Map(
      selectedBookings
        .map((b) => customerById.get(b.customerId))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((c) => [c.id, c]),
    ).values(),
  ];

  const columns: Column<AdminBooking>[] = [
    {
      key: "item",
      header: "Item",
      sortable: true,
      sortValue: (b) => b.item.name,
      render: (b) => (
        <div className="flex items-center gap-2">
          <img src={b.item.image} alt={b.item.alt} className="size-8 rounded object-cover" />
          <span className="font-semibold">{b.item.name}</span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      sortValue: (b) => customerById.get(b.customerId)?.name ?? "",
      render: (b) => {
        const c = customerById.get(b.customerId);
        return (
          <div>
            <p className="font-semibold">{c?.name ?? "Unknown"}</p>
            <p className="text-xs text-muted-foreground">{b.address.city}</p>
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Event date",
      sortable: true,
      sortValue: (b) => b.eventDate,
      render: (b) => (
        <span className="text-muted-foreground">{format(b.eventDate, "MMM d, yyyy")}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      sortValue: (b) => b.total,
      render: (b) => <span className="font-bold">{formatMoney(b.total)}</span>,
    },
    {
      key: "payment",
      header: "Payment",
      sortable: true,
      sortValue: (b) => b.paymentStatus,
      render: (b) => (
        <span
          className={
            b.paymentStatus === "unpaid"
              ? "text-xs font-bold capitalize text-amber-600"
              : b.paymentStatus === "refunded"
                ? "text-xs font-bold capitalize text-rose-600"
                : "text-xs font-bold capitalize text-emerald-600"
          }
        >
          {b.paymentStatus.replace(/-/g, " ")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (b) => b.status,
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (b) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              className="h-8 px-2"
            >
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onRowClick(b)}>View details</DropdownMenuItem>
            {b.status === "open" && (
              <DropdownMenuItem
                onClick={() => {
                  bookingActions.setStatus(b.id, "sent");
                  toast.success("Invoice marked as sent");
                }}
              >
                Mark invoice sent
              </DropdownMenuItem>
            )}
            {b.status !== "confirmed" && b.status !== "cancelled" && (
              <DropdownMenuItem
                onClick={() => {
                  bookingActions.setStatus(b.id, "confirmed");
                  toast.success("Booking confirmed");
                }}
              >
                Confirm booking
              </DropdownMenuItem>
            )}
            {b.status !== "completed" && b.status !== "cancelled" && (
              <DropdownMenuItem
                onClick={() => {
                  bookingActions.setStatus(b.id, "completed");
                  toast.success("Marked complete");
                }}
              >
                Mark completed
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {b.status !== "cancelled" && (
              <DropdownMenuItem
                onClick={() => {
                  bookingActions.setStatus(b.id, "cancelled");
                  toast.success("Booking cancelled");
                }}
              >
                Cancel booking
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                bookingActions.remove(b.id);
                toast.success("Booking deleted");
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const bulkStatus = (status: AdminBookingStatus) => {
    bookingActions.bulkSetStatus([...selected], status);
    setSelected(new Set());
    toast.success(`${selected.size} booking(s) updated`);
  };

  return (
    <>
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(b) => b.id}
        onRowClick={onRowClick}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        loading={loading}
        emptyState={
          <EmptyState
            icon={CalendarIcon}
            title="No bookings found"
            description="Try adjusting your filters or date range."
          />
        }
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChips
              options={[
                { value: "all" as BookingFilter, label: "All", count: counts.all },
                { value: "open" as BookingFilter, label: "Open", count: counts.open },
                { value: "sent" as BookingFilter, label: "Invoiced", count: counts.sent },
                {
                  value: "confirmed" as BookingFilter,
                  label: "Confirmed",
                  count: counts.confirmed,
                },
                {
                  value: "completed" as BookingFilter,
                  label: "Completed",
                  count: counts.completed,
                },
                {
                  value: "cancelled" as BookingFilter,
                  label: "Cancelled",
                  count: counts.cancelled,
                },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <div className="flex flex-wrap items-center gap-2">
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search item, customer, city…"
              />
              {selected.size > 0 && (
                <>
                  <Button size="sm" variant="outline" onClick={() => setBulkEmailOpen(true)}>
                    <Mail className="size-3.5" /> Email ({selectedCustomers.length})
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">Bulk actions ({selected.size})</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => bulkStatus("sent")}>
                        Mark invoice sent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkStatus("confirmed")}>
                        Confirm
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkStatus("completed")}>
                        Mark completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkStatus("cancelled")}>
                        Cancel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setConfirmBulkDelete(true)}
                      >
                        <Trash2 className="size-3.5" /> Delete selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        }
      />

      <EmailComposer
        open={bulkEmailOpen}
        onOpenChange={setBulkEmailOpen}
        recipients={selectedCustomers}
        onSent={() => setSelected(new Set())}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title={`Delete ${selected.size} booking(s)?`}
        description="This permanently removes the selected bookings and their revenue history. Cancelling instead preserves the audit trail."
        confirmLabel="Delete permanently"
        destructive
        onConfirm={() => {
          bookingActions.bulkRemove([...selected]);
          setSelected(new Set());
          setConfirmBulkDelete(false);
          toast.success("Bookings deleted");
        }}
      />
    </>
  );
}
