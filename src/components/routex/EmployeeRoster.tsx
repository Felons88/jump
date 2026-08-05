import { useState } from "react";
import { Mail, Phone, Plus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getEmployees, type Employee } from "@/data/routeXData";

export function EmployeeRoster({ onAssign }: { onAssign?: (employee: Employee) => void }) {
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"lead" | "helper" | "driver">("helper");

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const emp: Employee = {
      id: `emp-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
    };
    setEmployees((prev) => [...prev, emp]);
    setNewName("");
    setNewEmail("");
    setShowAdd(false);
    toast.success(`${emp.name} added to roster`);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Employee Roster
        </p>
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus className="size-3.5" /> Add
        </Button>
      </div>

      {showAdd && (
        <div className="space-y-2 border-b border-border bg-muted/30 p-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name"
            className="h-8 text-sm"
          />
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@jumpcity.com"
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            {(["lead", "driver", "helper"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setNewRole(r)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-bold capitalize transition-colors",
                  newRole === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7" onClick={handleAdd}>
              <Plus className="size-3" /> Add
            </Button>
            <Button size="sm" variant="ghost" className="h-7" onClick={() => setShowAdd(false)}>
              <X className="size-3" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="flex items-center gap-3 border-b border-border/50 p-3 last:border-0 hover:bg-muted/30"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-black text-primary">
              {emp.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{emp.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="size-3" />
                <span className="truncate">{emp.email}</span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "capitalize",
                emp.role === "lead" && "bg-sky-100 text-sky-700",
                emp.role === "driver" && "bg-amber-100 text-amber-700",
                emp.role === "helper" && "bg-violet-100 text-violet-700",
              )}
            >
              {emp.role}
            </Badge>
            {onAssign && (
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onAssign(emp)}>
                <Phone className="size-3" /> Assign
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
