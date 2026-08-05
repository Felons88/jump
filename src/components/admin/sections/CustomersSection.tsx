import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Mail, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/data/mockBookings";
import { customerActions, customerMetrics, useAdminState } from "@/data/adminStore";
import type { AdminCustomer } from "@/data/adminTypes";
import {
  DataTable,
  EmptyState,
  FilterChips,
  TableSearch,
  type Column,
} from "@/components/admin/AdminPrimitives";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmailComposer } from "@/components/admin/EmailComposer";

type CustomerFilter = "all" | "vip" | "repeat" | "at-risk" | "newsletter" | "archived";

export function CustomersSection({
  onRowClick,
  loading = false,
}: {
  onRowClick: (c: AdminCustomer) => void;
  loading?: boolean;
}) {
  const { customers, bookings } = useAdminState();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // New customer draft
  const [nName, setNName] = useState("");
  const [nEmail, setNEmail] = useState("");
  const [nPhone, setNPhone] = useState("");
  const [nOptIn, setNOptIn] = useState(true);

  const enriched = useMemo(
    () =>
      customers.map((c) => ({
        customer: c,
        metrics: customerMetrics(c.id, bookings),
      })),
    [customers, bookings],
  );

  const filtered = useMemo(() => {
    let result = enriched;

    switch (filter) {
      case "vip":
        result = result.filter((r) => r.customer.tags.includes("vip"));
        break;
      case "repeat":
        result = result.filter((r) => r.metrics.bookingCount >= 2);
        break;
      case "at-risk":
        result = result.filter(
          (r) => r.metrics.bookingCount > 0 && (r.metrics.daysSinceLastBooking ?? 0) >= 90,
        );
        break;
      case "newsletter":
        result = result.filter((r) => r.customer.newsletterOptIn);
        break;
      case "archived":
        result = result.filter((r) => r.customer.archived);
        break;
      default:
        result = result.filter((r) => !r.customer.archived);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.customer.name.toLowerCase().includes(q) ||
          r.customer.email.toLowerCase().includes(q) ||
          r.customer.phone.toLowerCase().includes(q),
      );
    }
    return result;
  }, [enriched, filter, search]);

  type Row = (typeof enriched)[number];

  const selectedCustomers = customers.filter((c) => selected.has(c.id));

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      sortValue: (r) => r.customer.name,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-black text-primary">
            {r.customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{r.customer.name}</p>
            <p className="truncate text-xs text-muted-foreground">{r.customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => <span className="text-muted-foreground">{r.customer.phone}</span>,
    },
    {
      key: "ltv",
      header: "Lifetime value",
      sortable: true,
      sortValue: (r) => r.metrics.lifetimeValue,
      render: (r) => <span className="font-bold">{formatMoney(r.metrics.lifetimeValue)}</span>,
    },
    {
      key: "bookings",
      header: "Bookings",
      sortable: true,
      sortValue: (r) => r.metrics.bookingCount,
      render: (r) => <span className="font-bold">{r.metrics.bookingCount}</span>,
    },
    {
      key: "last",
      header: "Last booking",
      sortable: true,
      sortValue: (r) => r.metrics.lastBookingDate ?? new Date(0),
      render: (r) =>
        r.metrics.lastBookingDate ? (
          <div>
            <p className="text-muted-foreground">
              {format(r.metrics.lastBookingDate, "MMM d, yyyy")}
            </p>
            {(r.metrics.daysSinceLastBooking ?? 0) >= 90 && (
              <p className="text-xs font-bold text-amber-600">
                {r.metrics.daysSinceLastBooking}d quiet
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">Never</span>
        ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.customer.tags.slice(0, 2).map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] capitalize">
              {t.replace("-", " ")}
            </Badge>
          ))}
          {r.customer.newsletterOptIn && <Badge className="text-[10px]">Subscribed</Badge>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onRowClick(r.customer)}>Open profile</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelected(new Set([r.customer.id]));
                setEmailOpen(true);
              }}
            >
              Send email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                customerActions.update(r.customer.id, {
                  newsletterOptIn: !r.customer.newsletterOptIn,
                })
              }
            >
              {r.customer.newsletterOptIn ? "Unsubscribe" : "Subscribe"} from newsletter
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                customerActions.setArchived(r.customer.id, !r.customer.archived);
                toast.success(r.customer.archived ? "Restored" : "Archived");
              }}
            >
              {r.customer.archived ? "Restore" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                customerActions.remove(r.customer.id);
                toast.success("Customer deleted");
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleCreate = () => {
    if (!nName.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(nEmail.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (customers.some((c) => c.email.toLowerCase() === nEmail.trim().toLowerCase())) {
      toast.error("A customer with that email already exists.");
      return;
    }
    customerActions.create({
      name: nName.trim(),
      email: nEmail.trim(),
      phone: nPhone.trim(),
      address: null,
      newsletterOptIn: nOptIn,
      tags: ["new"],
    });
    setNName("");
    setNEmail("");
    setNPhone("");
    setNOptIn(true);
    setCreateOpen(false);
    toast.success("Customer created");
  };

  return (
    <>
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.customer.id}
        onRowClick={(r) => onRowClick(r.customer)}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        loading={loading}
        emptyState={
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Try a different search term or filter."
          />
        }
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChips
              options={[
                {
                  value: "all" as CustomerFilter,
                  label: "Active",
                  count: customers.filter((c) => !c.archived).length,
                },
                {
                  value: "vip" as CustomerFilter,
                  label: "VIP",
                  count: customers.filter((c) => c.tags.includes("vip")).length,
                },
                {
                  value: "repeat" as CustomerFilter,
                  label: "Repeat",
                  count: enriched.filter((r) => r.metrics.bookingCount >= 2).length,
                },
                {
                  value: "at-risk" as CustomerFilter,
                  label: "At risk",
                  count: enriched.filter(
                    (r) =>
                      r.metrics.bookingCount > 0 && (r.metrics.daysSinceLastBooking ?? 0) >= 90,
                  ).length,
                },
                {
                  value: "newsletter" as CustomerFilter,
                  label: "Subscribed",
                  count: customers.filter((c) => c.newsletterOptIn).length,
                },
                {
                  value: "archived" as CustomerFilter,
                  label: "Archived",
                  count: customers.filter((c) => c.archived).length,
                },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <div className="flex flex-wrap items-center gap-2">
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search name, email, phone…"
              />
              {selected.size > 0 && (
                <>
                  <Button size="sm" onClick={() => setEmailOpen(true)}>
                    <Mail className="size-3.5" /> Email ({selected.size})
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmBulkDelete(true)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                <Plus className="size-3.5" /> New customer
              </Button>
            </div>
          </div>
        }
      />

      <EmailComposer
        open={emailOpen}
        onOpenChange={setEmailOpen}
        recipients={selectedCustomers}
        onSent={() => setSelected(new Set())}
      />

      {/* Create customer */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-bold">Full name</Label>
              <Input
                value={nName}
                onChange={(e) => setNName(e.target.value)}
                placeholder="Jane Smith"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Email</Label>
              <Input
                value={nEmail}
                onChange={(e) => setNEmail(e.target.value)}
                placeholder="jane@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Phone</Label>
              <Input
                value={nPhone}
                onChange={(e) => setNPhone(e.target.value)}
                placeholder="(763) 555-0100"
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-bold">Newsletter opt-in</p>
                <p className="text-xs text-muted-foreground">Include in marketing sends</p>
              </div>
              <Switch checked={nOptIn} onCheckedChange={setNOptIn} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title={`Delete ${selected.size} customer(s)?`}
        description="This also deletes every booking attached to them and cannot be undone. Archiving hides them without losing history."
        confirmLabel="Delete permanently"
        destructive
        onConfirm={() => {
          selected.forEach((id) => customerActions.remove(id));
          setSelected(new Set());
          setConfirmBulkDelete(false);
          toast.success("Customers deleted");
        }}
      />
    </>
  );
}
