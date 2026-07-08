import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HistoryPage } from "@/pages/HistoryPage";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Interaction History · MedRep AI" },
      { name: "description", content: "Search, filter, and review previously logged HCP interactions." },
    ],
  }),
  component: () => (
    <AppShell>
      <HistoryPage />
    </AppShell>
  ),
});