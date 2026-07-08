import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LogInteractionPage } from "@/pages/LogInteractionPage";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "Log HCP Interaction · MedRep AI" },
      { name: "description", content: "Log a healthcare professional interaction via structured form or AI conversational assistant." },
    ],
  }),
  component: () => (
    <AppShell>
      <LogInteractionPage />
    </AppShell>
  ),
});