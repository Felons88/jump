import { useState } from "react";
import { format, isBefore } from "date-fns";
import { Plus, Tag } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/data/mockBookings";
import { promoActions, useAdminState } from "@/data/adminStore";
import type { AdminPromoCode } from "@/data/adminTypes";
import {
  DataTable,
  EmptyState,
  KpiCard,
  TableSearch,
  type Column,
} from "@/components/admin/AdminPrimitives";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PromoEditDialog } from "@/components/admin/PromoEditDialog";

export function PromosSection() {
  const { promos } = useAdminState();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminPromoCode | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminPromoCode | null>(null);

  const filtered = search.trim()
    ? promos.filter(
        (p) =>
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      )
    : promos;

  const totalRedemptions = promos.reduce((s, p) => s + p.usageCount, 0);
  const activeCount = promos.filter((p) => p.active).length;
  const expiredCount = promos.filter(
    (p) => p.expiresAt !== null && isBefore(p.expiresAt, new Date()),
  ).length;

  const openCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };

  const openEdit = (p: AdminPromoCode) => {
    setEditing(p);
    setEditOpen(true);
  };

  const columns: Column<AdminPromoCode>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      sortValue: (p) => p.code,
      render: (p) => (
        <div>
          <p className="font-display font-black text-primary">{p.code}</p>
          <p className="text-xs text-muted-foreground">{p.description}</p>
        </div>
      ),
    },
    {
      key: "value",
      header: "Discount",
      sortable: true,
      sortValue: (p) => p.value,
      render: (p) => (
        <span className="font-bold">
          {p.type === "percent" ? `${p.value}% off` : `${formatMoney(p.value)} off`}
        </span>
      ),
    },
    {
      key: "minOrder",
      header: "Min order",
      sortable: true,
      sortValue: (p) => p.minOrder,
      render: (p) => (
        <span className="text-muted-foreground">
          {p.minOrder > 0 ? formatMoney(p.minOrder) : "—"}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Redemptions",
      sortable: true,
      sortValue: (p) => p.usageCount,
      render: (p) => (
        <div className="w-28">
          <p className="text-xs font-bold">
            {p.usageCount}
            {p.usageLimit !== null && ` / ${p.usageLimit}`}
          </p>
          {p.usageLimit !== null && (
            <Progress
              value={Math.min((p.usageCount / p.usageLimit) * 100, 100)}
              className="mt-1 h-1.5"
            />
          )}
        </div>
      ),
    },
    {
      key: "expires",
      header: "Expires",
      sortable: true,
      sortValue: (p) => p.expiresAt ?? new Date(8640000000000000),
      render: (p) => {
        if (!p.expiresAt) return <span className="text-xs text-muted-foreground">Never</span>;
        const expired = isBefore(p.expiresAt, new Date());
        return (
          <span
            className={
              expired ? "text-xs font-bold text-rose-600" : "text-xs text-muted-foreground"
            }
          >
            {format(p.expiresAt, "MMM d, yyyy")}
            {expired && " (expired)"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Active",
      sortable: true,
      sortValue: (p) => (p.active ? "1" : "0"),
      render: (p) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={p.active}
            onCheckedChange={() => {
              promoActions.toggleActive(p.id);
              toast.success(`${p.code} ${p.active ? "deactivated" : "activated"}`);
            }}
          />
          {p.usageLimit !== null && p.usageCount >= p.usageLimit && (
            <Badge variant="secondary" className="text-[10px]">
              Limit hit
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
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
            <DropdownMenuItem onClick={() => openEdit(p)}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard?.writeText(p.code);
                toast.success(`${p.code} copied to clipboard`);
              }}
            >
              Copy code
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                promoActions.create({
                  code: `${p.code}COPY`,
                  description: p.description,
                  type: p.type,
                  value: p.value,
                  minOrder: p.minOrder,
                  expiresAt: p.expiresAt,
                  usageLimit: p.usageLimit,
                  active: false,
                });
                toast.success(`Duplicated as ${p.code}COPY (inactive)`);
              }}
            >
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(p)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Active codes" value={String(activeCount)} icon={Tag} />
        <KpiCard label="Total redemptions" value={String(totalRedemptions)} icon={Tag} />
        <KpiCard label="Expired codes" value={String(expiredCount)} icon={Tag} />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        onRowClick={openEdit}
        emptyState={
          <EmptyState
            icon={Tag}
            title="No promo codes"
            description="Create a code to run your first promotion."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-3.5" /> Create code
              </Button>
            }
          />
        }
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TableSearch value={search} onChange={setSearch} placeholder="Search promo codes…" />
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-3.5" /> Create code
            </Button>
          </div>
        }
      />

      <PromoEditDialog promo={editing} open={editOpen} onOpenChange={setEditOpen} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.code ?? "code"}?`}
        description="Customers using this code at checkout will be rejected. Deactivating it instead keeps the redemption history intact."
        confirmLabel="Delete permanently"
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            promoActions.remove(deleteTarget.id);
            toast.success("Promo code deleted");
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
