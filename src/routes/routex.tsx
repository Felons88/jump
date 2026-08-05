import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { RouteXLayout } from "@/components/routex/RouteXLayout";
import { RouteXCommandPalette } from "@/components/routex/RouteXCommandPalette";

export const Route = createFileRoute("/routex")({
  head: () => ({
    meta: [{ title: "RouteX Fleet Routing | Jump City" }],
  }),
  component: RouteXLayoutRoute,
});

function RouteXLayoutRoute() {
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <RouteXLayout onOpenCommand={() => setCmdOpen(true)}>
      <RouteXCommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <Outlet />
    </RouteXLayout>
  );
}
