import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CollectionsAdmin } from "@/components/admin/CollectionsAdmin";
import { NewsAdmin } from "@/components/admin/NewsAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Dennis Hagemeijer Fotografie" },
      { name: "description", content: "Beheer collecties, foto's en nieuwsberichten." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — Dennis Hagemeijer Fotografie" },
      { property: "og:description", content: "Beheeromgeving." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="page-shell space-y-16 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Beheer</p>
          <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        </div>
        <Button variant="outline" onClick={() => void signOut()}>
          <LogOut className="mr-2 size-4" /> Uitloggen
        </Button>
      </div>

      <CollectionsAdmin />
      <NewsAdmin />
      <SettingsAdmin />
    </div>
  );
}
