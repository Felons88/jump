import { useMemo, useState } from "react";
import { Package, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/data/mockBookings";
import { inventoryActions, useAdminState } from "@/data/adminStore";
import type { AdminInventoryItem, InventoryStatus } from "@/data/adminTypes";
import {
  DataTable,
  EmptyState,
  FilterChips,
  KpiCard,
  TableSearch,
  type Column,
} from "@/components/admin/AdminPrimitives";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { InventoryEditDialog } from "@/components/admin/InventoryEditDialog";

const STATUSES: InventoryStatus[] = [
  "available",
  "reserved",
  "damaged",
  "out-for-cleaning",
  "retired",
];

const STATUS_STYLES: Record<InventoryStatus, string> = {
  available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  reserved: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  damaged: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  "out-for-cleaning": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  retired: "bg-muted text-muted-foreground",
};

export function InventorySection() {
  const { inventory } = useAdminState();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "all">("all");
  const [editing, setEditing] = useState<AdminInventoryItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminInventoryItem | null>(null);

  const filtered = useMemo(() => {
    let result = inventory;
    if (statusFilter !== "all") result = result.filter((i) => i.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.categorySlug.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q),
      );
    }
    return result;
  }, [inventory, search, statusFilter]);

  /* Fleet-level economics — what the equipment is actually earning. */
  const fleet = useMemo(() => {
    const assetValue = inventory.reduce((s, i) => s + i.purchasePrice, 0);
    const revenue = inventory.reduce((s, i) => s + i.timesRented * i.priceFrom, 0);
    const maintenance = inventory.reduce(
      (s, i) => s + i.maintenance.reduce((ms, m) => ms + m.cost, 0),
      0,
    );
    const utilizationBase = inventory.filter((i) => i.status !== "retired").length;
    const inService = inventory.filter(
      (i) => i.status === "available" || i.status === "reserved",
    ).length;
    return {
      assetValue,
      revenue,
      maintenance,
      readiness: utilizationBase > 0 ? Math.round((inService / utilizationBase) * 100) : 0,
    };
  }, [inventory]);

  const openCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };

  const openEdit = (item: AdminInventoryItem) => {
    setEditing(item);
    setEditOpen(true);
  };

  const columns: Column<AdminInventoryItem>[] = [
    {
      key: "item",
      header: "Item",
      sortable: true,
      sortValue: (i) => i.name,
      render: (i) => (
        <div className="flex items-center gap-2">
          <img src={i.image} alt={i.alt} className="size-8 rounded object-cover" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{i.name}</p>
            <p className="text-xs text-muted-foreground">{i.categorySlug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rentals",
      header: "Times rented",
      sortable: true,
      sortValue: (i) => i.timesRented,
      render: (i) => <span className="font-bold">{i.timesRented}</span>,
    },
    {
      key: "revenue",
      header: "Revenue (est.)",
      sortable: true,
      sortValue: (i) => i.timesRented * i.priceFrom,
      render: (i) => <span className="font-bold">{formatMoney(i.timesRented * i.priceFrom)}</span>,
    },
    {
      key: "condition",
      header: "Condition",
      sortable: true,
      sortValue: (i) => i.condition,
      render: (i) => (
        <div className="flex items-center gap-1">
          <span className="font-bold">{i.condition}</span>
          <span className="text-xs text-muted-foreground">/5</span>
          {i.condition <= 2 && (
            <Badge variant="secondary" className="ml-1 text-[10px] text-rose-600">
              Replace
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "maintenance",
      header: "Service",
      sortable: true,
      sortValue: (i) => i.maintenance.length,
      render: (i) =>
        i.maintenance.length === 0 ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Wrench className="size-3" /> {i.maintenance.length} ·{" "}
            {formatMoney(i.maintenance.reduce((s, m) => s + m.cost, 0))}
          </span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (i) => i.status,
      render: (i) => (
        <Select
          value={i.status}
          onValueChange={(v) => {
            inventoryActions.setStatus(i.id, v as InventoryStatus);
            toast.success(`Status set to ${v.replace(/-/g, " ")}`);
          }}
        >
          <SelectTrigger
            className={`h-8 w-36 border-0 font-semibold capitalize ${STATUS_STYLES[i.status]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace(/-/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (i) => (
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
            <DropdownMenuItem onClick={() => openEdit(i)}>Edit / service log</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                inventoryActions.addMaintenance(i.id, {
                  at: new Date(),
                  type: "cleaning",
                  note: "Routine post-rental cleaning",
                  cost: 0,
                  performedBy: "Crew",
                });
                inventoryActions.setStatus(i.id, "available");
                toast.success("Cleaning logged and returned to service");
              }}
            >
              Quick-log cleaning
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(i)}>
              Delete item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Fleet size" value={String(inventory.length)} icon={Package} />
        <KpiCard label="Asset value" value={formatMoney(fleet.assetValue)} icon={Package} />
        <KpiCard label="Revenue generated" value={formatMoney(fleet.revenue)} icon={Package} />
        <KpiCard label="Fleet readiness" value={`${fleet.readiness}%`} icon={Package} />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(i) => i.id}
        onRowClick={openEdit}
        emptyState={
          <EmptyState
            icon={Package}
            title="No inventory items"
            description="Add your first rental unit to start tracking utilization."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-3.5" /> Add item
              </Button>
            }
          />
        }
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChips
              options={[
                { value: "all" as const, label: "All", count: inventory.length },
                ...STATUSES.map((s) => ({
                  value: s,
                  label: s === "out-for-cleaning" ? "Cleaning" : s.replace(/-/g, " "),
                  count: inventory.filter((i) => i.status === s).length,
                })),
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <div className="flex items-center gap-2">
              <TableSearch value={search} onChange={setSearch} placeholder="Search inventory…" />
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-3.5" /> Add item
              </Button>
            </div>
          </div>
        }
      />

      <InventoryEditDialog item={editing} open={editOpen} onOpenChange={setEditOpen} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name ?? "item"}?`}
        description="This removes the unit and its service history from inventory. Set it to 'retired' instead if you want to keep the records."
        confirmLabel="Delete permanently"
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            inventoryActions.remove(deleteTarget.id);
            toast.success("Inventory item deleted");
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
