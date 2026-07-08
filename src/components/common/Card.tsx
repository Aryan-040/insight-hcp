import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/utils/format";

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "rounded-2xl bg-card text-card-foreground border border-border shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.03)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "flex items-start justify-between gap-3 p-5 border-b border-border",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="font-semibold text-base leading-tight">{title}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={classNames("p-5", className)}>{children}</div>;
}