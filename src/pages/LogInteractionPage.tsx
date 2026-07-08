import { Card } from "@/components/common/Card";
import { InteractionForm } from "@/components/interaction/InteractionForm";
import { ChatPanel } from "@/components/interaction/ChatPanel";

export function LogInteractionPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Log HCP Interaction
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill the form manually, or describe your meeting to the AI Assistant on the right.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-5">
        <Card className="p-5 xl:p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div>
              <div className="font-semibold">Interaction Details</div>
              <div className="text-xs text-muted-foreground">
                All fields sync with the AI Assistant in real time.
              </div>
            </div>
          </div>
          <InteractionForm />
        </Card>

        <Card className="min-h-[600px] xl:sticky xl:top-24 xl:self-start xl:h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
          <ChatPanel />
        </Card>
      </div>
    </div>
  );
}