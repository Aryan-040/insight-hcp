import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-12 px-6">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-muted grid place-items-center mx-auto mb-3 text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="font-medium text-sm">{title}</div>
      {description && (
        <div className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          {description}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}