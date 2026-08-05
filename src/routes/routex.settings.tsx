import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Key,
  Mail,
  Map as MapIcon,
  MapPin,
  Plus,
  Settings as SettingsIcon,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { hasMapboxToken } from "@/lib/routeOptimizer";
import { hasBrevoKey } from "@/lib/brevo";
import {
  DEFAULT_CADENCE_CONFIG,
  VEHICLE_PROFILES,
  WAREHOUSE,
  type CadenceConfig,
  type VehicleProfile,
} from "@/data/routeXData";

export const Route = createFileRoute("/routex/settings")({
  head: () => ({
    meta: [{ title: "RouteX Settings | Jump City" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [cadence, setCadence] = useState<CadenceConfig>(DEFAULT_CADENCE_CONFIG);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>(VEHICLE_PROFILES);
  const [depot, setDepot] = useState({
    address: WAREHOUSE.address,
    lng: WAREHOUSE.lng,
    lat: WAREHOUSE.lat,
  });
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicleLabel, setNewVehicleLabel] = useState("");
  const [newVehicleCapacity, setNewVehicleCapacity] = useState("4");

  const handleSaveCadence = () => {
    toast.success("Cadence configuration saved");
  };

  const handleSaveDepot = () => {
    toast.success("Depot location updated");
  };

  const handleAddVehicle = () => {
    if (!newVehicleLabel.trim()) return;
    const v: VehicleProfile = {
      id: `v${Date.now()}`,
      label: newVehicleLabel.trim(),
      capacity: parseInt(newVehicleCapacity) || 4,
      available: true,
    };
    setVehicles((prev) => [...prev, v]);
    setNewVehicleLabel("");
    setNewVehicleCapacity("4");
    setShowAddVehicle(false);
    toast.success("Vehicle profile added");
  };

  const toggleVehicle = (id: string) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, available: !v.available } : v)));
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h2 className="text-lg font-extrabold">RouteX Settings</h2>
        <p className="text-xs text-muted-foreground">
          API keys, vehicle profiles, depot location, and cadence configuration
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* API Keys */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Key className="size-4 text-primary" />
              <p className="text-sm font-bold">API Keys</p>
            </div>

            <div className="space-y-3">
              {/* Mapbox */}
              <div
                className={cn(
                  "rounded-lg border p-3",
                  hasMapboxToken
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-border bg-muted/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <MapIcon className="size-4 text-muted-foreground" />
                  <p className="text-sm font-bold">Mapbox Token</p>
                  {hasMapboxToken ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="size-3" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      <Circle className="size-3" /> Not set
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Enables live map rendering, route optimization, and geocoding.
                </p>
                {!hasMapboxToken && (
                  <a
                    href="https://account.mapbox.com/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Get Mapbox token →
                  </a>
                )}
                <p className="mt-2 text-[10px] font-mono text-muted-foreground">
                  VITE_MAPBOX_TOKEN
                </p>
              </div>

              {/* Brevo */}
              <div
                className={cn(
                  "rounded-lg border p-3",
                  hasBrevoKey ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-muted/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <p className="text-sm font-bold">Brevo API Key</p>
                  {hasBrevoKey ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="size-3" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      <Circle className="size-3" /> Not set
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Enables dispatch email notifications to drivers and delivery alerts to customers.
                </p>
                {!hasBrevoKey && (
                  <a
                    href="https://app.brevo.com/settings/keys/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Get Brevo key →
                  </a>
                )}
                <p className="mt-2 text-[10px] font-mono text-muted-foreground">
                  VITE_BREVO_API_KEY
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Profiles */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                <p className="text-sm font-bold">Vehicle Profiles</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7"
                onClick={() => setShowAddVehicle(!showAddVehicle)}
              >
                <Plus className="size-3" /> Add
              </Button>
            </div>

            {showAddVehicle && (
              <div className="mb-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <Input
                  value={newVehicleLabel}
                  onChange={(e) => setNewVehicleLabel(e.target.value)}
                  placeholder="Vehicle label (e.g. Vehicle 4 — Ram 2500)"
                  className="h-8 text-sm"
                />
                <Input
                  value={newVehicleCapacity}
                  onChange={(e) => setNewVehicleCapacity(e.target.value)}
                  placeholder="Capacity (items)"
                  type="number"
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="h-7" onClick={handleAddVehicle}>
                    <Plus className="size-3" /> Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7"
                    onClick={() => setShowAddVehicle(false)}
                  >
                    <X className="size-3" /> Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-2.5"
                >
                  <Truck className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{v.label}</p>
                    <p className="text-xs text-muted-foreground">Capacity: {v.capacity} items</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleVehicle(v.id)}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors",
                      v.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {v.available ? "Available" : "Off-duty"}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Depot Location */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <p className="text-sm font-bold">Depot / Warehouse Location</p>
            </div>
            <div className="space-y-2">
              <Input
                value={depot.address}
                onChange={(e) => setDepot({ ...depot, address: e.target.value })}
                placeholder="Street address"
                className="text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={String(depot.lng)}
                  onChange={(e) => setDepot({ ...depot, lng: parseFloat(e.target.value) || 0 })}
                  placeholder="Longitude"
                  type="number"
                  step="0.0001"
                  className="text-sm"
                />
                <Input
                  value={String(depot.lat)}
                  onChange={(e) => setDepot({ ...depot, lat: parseFloat(e.target.value) || 0 })}
                  placeholder="Latitude"
                  type="number"
                  step="0.0001"
                  className="text-sm"
                />
              </div>
              <Button size="sm" onClick={handleSaveDepot}>
                Save depot
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cadence Configuration */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <SettingsIcon className="size-4 text-primary" />
              <p className="text-sm font-bold">Cadence Configuration</p>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Controls when automated route planning stages execute each day.
            </p>
            <div className="space-y-2">
              {(
                [
                  { key: "draftTime", label: "Draft generation" },
                  { key: "recheckTime", label: "Availability recheck" },
                  { key: "rebuildTime", label: "Route rebuild" },
                  { key: "finalizeTime", label: "Finalize routes" },
                  { key: "dispatchTime", label: "Dispatch to staff" },
                ] as const
              ).map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-muted-foreground">{field.label}</label>
                  <Input
                    value={cadence[field.key]}
                    onChange={(e) => setCadence({ ...cadence, [field.key]: e.target.value })}
                    className="h-8 w-40 text-sm"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                <label className="text-xs font-bold text-muted-foreground">Timezone</label>
                <span className="text-sm font-semibold">{cadence.timezone}</span>
              </div>
              <Button size="sm" onClick={handleSaveCadence} className="mt-2">
                Save cadence
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
