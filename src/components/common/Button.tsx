import type { ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "@/utils/format";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-muted text-foreground",
  outline:
    "border border-border bg-background hover:bg-muted text-foreground",
  danger: "bg-destructive text-destructive-foreground hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-lg",
  icon: "h-9 w-9 rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}