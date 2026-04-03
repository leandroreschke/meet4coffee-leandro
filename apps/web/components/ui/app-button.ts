type AppButtonVariant = "primary" | "secondary" | "neutral" | "danger";
type AppButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center rounded-full border-4 border-mocha-earth font-black uppercase tracking-[0.14em] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60";

const VARIANT_MAP: Record<AppButtonVariant, string> = {
  primary:
    "bg-mocha-earth text-vanilla-cream! shadow-[4px_4px_0px_var(--banana-split)] hover:bg-banana-split hover:text-mocha-earth!",
  secondary:
    "bg-white text-mocha-earth shadow-[4px_4px_0px_var(--cotton-candy)] hover:bg-cotton-candy",
  neutral:
    "bg-white text-mocha-earth shadow-[4px_4px_0px_var(--mocha-earth)] hover:bg-lavender-haze",
  danger:
    "bg-rose-600 text-rose-50! border-rose-700 shadow-[4px_4px_0px_#881337] hover:bg-rose-500",
};

const SIZE_MAP: Record<AppButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function appButtonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return [
    BASE,
    VARIANT_MAP[variant],
    SIZE_MAP[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

