import { useEffect } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Map as MapIcon,
  Package,
  Settings,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";

type RouteXCommand = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  shortcut?: string;
};

const NAV_COMMANDS: RouteXCommand[] = [
  {
    id: "overview",
    label: "Overview / Command Center",
    icon: LayoutDashboard,
    to: "/routex",
    shortcut: "G O",
  },
  {
    id: "live-map",
    label: "Live Fleet Map",
    icon: MapIcon,
    to: "/routex/live-map",
    shortcut: "G M",
  },
  { id: "routes", label: "Routes & Builder", icon: Truck, to: "/routex/routes", shortcut: "G R" },
  { id: "drivers", label: "Drivers", icon: Users, to: "/routex/drivers", shortcut: "G D" },
  {
    id: "deliveries",
    label: "Deliveries",
    icon: Package,
    to: "/routex/deliveries",
    shortcut: "G L",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    to: "/routex/analytics",
    shortcut: "G A",
  },
  { id: "settings", label: "Settings", icon: Settings, to: "/routex/settings", shortcut: "G S" },
];

export function RouteXCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

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

  const handleSelect = (cmd: RouteXCommand) => {
    onOpenChange(false);
    void navigate({ to: cmd.to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search RouteX…" />
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
    </CommandDialog>
  );
}
