export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateInviteToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale = "en-US",
  timeZone?: string,
) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatRelativeSeats(current: number, max: number | null) {
  return max === null ? `${current} / unlimited` : `${current} / ${max}`;
}

export const BLOCK_COLORS = [
  "var(--strawberry-milk)",
  "var(--lavender-haze)",
  "var(--banana-split)",
  "var(--matcha-latte)",
  "var(--cotton-candy)",
  "var(--vanilla-cream)",
] as const;

export function getShadowColor(seedStr?: string | null) {
  if (!seedStr) {
    return BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
  }
  const hash = String(seedStr)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BLOCK_COLORS[hash % BLOCK_COLORS.length];
}
