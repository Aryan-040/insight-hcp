import type { ReactNode } from "react";
import { classNames } from "@/utils/format";

type Tone = "default" | "primary" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/15 text-info",
};

export function Badge({
  tone = "default",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SentimentBadge({ sentiment }: { sentiment: string }) {
  const tone: Tone =
    sentiment === "positive"
      ? "success"
      : sentiment === "negative"
        ? "danger"
        : "warning";
  const dot =
    sentiment === "positive"
      ? "bg-success"
      : sentiment === "negative"
        ? "bg-destructive"
        : "bg-warning";
  return (
    <Badge tone={tone}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {sentiment[0].toUpperCase() + sentiment.slice(1)}
    </Badge>
  );
}