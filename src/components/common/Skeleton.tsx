import { classNames } from "@/utils/format";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={classNames(
        "animate-pulse rounded-md bg-muted/70",
        className,
      )}
    />
  );
}