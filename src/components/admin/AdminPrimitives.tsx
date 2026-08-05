import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ── Status badge system ────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  sent: {
    label: "Invoice sent",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  },
  completed: {
    label: "Completed",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="secondary" className={cn("font-semibold capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}

/* ── KPI card with trend ────────────────────────────────────────────── */

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-8 w-28" />
        ) : (
          <p className="mt-3 font-display text-2xl font-black tracking-tight">{value}</p>
        )}
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-bold",
                trend >= 0 ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {trend >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-xs font-semibold text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Date range selector ────────────────────────────────────────────── */

export type DateRangeKey = "today" | "7d" | "30d" | "all";

const RANGE_LABELS: Record<DateRangeKey, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  all: "All time",
};

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRangeKey;
  onChange: (key: DateRangeKey) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5">
      {(Object.keys(RANGE_LABELS) as DateRangeKey[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
            value === key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {RANGE_LABELS[key]}
        </button>
      ))}
    </div>
  );
}

/* ── Table skeleton ─────────────────────────────────────────────────── */

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-border/50 px-4 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" style={{ maxWidth: `${100 / cols}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm font-bold">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs font-semibold text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Sortable data table ────────────────────────────────────────────── */

export type SortDirection = "asc" | "desc";

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | Date;
  className?: string;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  loading?: boolean;
  pageSize?: number;
  emptyState?: ReactNode;
  toolbar?: ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectable = false,
  selectedIds,
  onSelectionChange,
  loading = false,
  pageSize = 10,
  emptyState,
  toolbar,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av instanceof Date && bv instanceof Date) return (av.getTime() - bv.getTime()) * dir;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = sortedRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  const allSelected =
    selectable && pageRows.length > 0 && pageRows.every((r) => selectedIds?.has(rowKey(r)));
  const someSelected = selectable && pageRows.some((r) => selectedIds?.has(rowKey(r)));

  const toggleAll = () => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (allSelected) {
      pageRows.forEach((r) => next.delete(rowKey(r)));
    } else {
      pageRows.forEach((r) => next.add(rowKey(r)));
    }
    onSelectionChange(next);
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <div className="space-y-3">
      {toolbar}
      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-left">
                {selectable && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = !allSelected && someSelected;
                      }}
                      onChange={toggleAll}
                      className="size-4 rounded border-border accent-primary"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground",
                      col.sortable && "cursor-pointer select-none hover:text-foreground",
                      col.className,
                    )}
                    onClick={() => handleSort(col)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <span className="opacity-50">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-0">
                    <TableSkeleton rows={6} cols={columns.length} />
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-0">
                    {emptyState ?? (
                      <EmptyState title="No results" description="Try adjusting your filters." />
                    )}
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const id = rowKey(row);
                  const isSelected = selectedIds?.has(id);
                  return (
                    <tr
                      key={id}
                      className={cn(
                        "border-b border-border/50 transition-colors last:border-0",
                        onRowClick && "cursor-pointer hover:bg-muted/30",
                        isSelected && "bg-primary/5",
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected ?? false}
                            onChange={() => toggleOne(id)}
                            className="size-4 rounded border-border accent-primary"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className={cn("px-4 py-3", col.className)}>
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {sortedRows.length > pageSize && (
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            {sortedRows.length} result{sortedRows.length === 1 ? "" : "s"} · showing{" "}
            {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, sortedRows.length)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Table search input ─────────────────────────────────────────────── */

export function TableSearch({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 max-w-xs"
    />
  );
}

/* ── Filter chip row ────────────────────────────────────────────────── */

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px]",
                value === opt.value ? "bg-primary-foreground/20" : "bg-background/60",
              )}
            >
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
