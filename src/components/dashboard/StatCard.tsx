import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/common/Card";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: number;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const toneBg = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/15 text-info",
  }[tone];

  const up = (delta ?? 0) >= 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="text-3xl font-semibold mt-1 tracking-tight">{value}</div>
          {delta !== undefined && (
            <div
              className={`inline-flex items-center gap-0.5 text-[11px] mt-1 ${
                up ? "text-success" : "text-destructive"
              }`}
            >
              {up ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(delta)}% vs last week
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${toneBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}