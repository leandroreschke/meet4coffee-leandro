"use client";

import { useSyncExternalStore } from "react";

import { MenuLink } from "@/components/menu-link";

type WorkspaceMenuItem = {
  href: string;
  title: string;
};

type MenuTheme = {
  colors: string[];
  tilts: number[];
  tapeTilts: number[];
};

const POST_IT_COLORS = [
  "var(--color-strawberry-milk, var(--color-balloon-pink, #f7c6d9))",
  "var(--color-lavender-haze, var(--color-balloon-purple, #d8c7f0))",
  "var(--color-banana-split, var(--color-balloon-yellow, #ffe58a))",
  "var(--color-matcha-latte, var(--color-balloon-green, #cdeedc))",
  "var(--color-cotton-candy, var(--color-balloon-blue, #cfe7ff))",
];

function randomIndex(max: number) {
  if (max <= 1) {
    return 0;
  }

  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % max;
}

function shuffleColors(colors: string[]) {
  const next = [...colors];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

function buildAlternatingTilts(count: number) {
  const magnitudes = [1.4, 2.1, 2.8, 3.4];
  const tilts: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const magnitude = magnitudes[randomIndex(magnitudes.length)];
    const direction = index % 2 === 0 ? -1 : 1;
    tilts.push(direction * magnitude);
  }

  return tilts;
}

function buildTapeTilts(count: number) {
  const offsets = [-2.8, -2.1, -1.4, -0.8, -0.2, 0.4, 1.1];
  return Array.from({ length: count }, () => offsets[randomIndex(offsets.length)] ?? 0);
}

function buildStableTilts(count: number) {
  const base = [-3.4, 3.4, -2.1, 2.1, -1.4, 1.4];
  return Array.from({ length: count }, (_, index) => base[index % base.length] ?? 0);
}

function buildStableTapeTilts(count: number) {
  const base = [-2.8, -1.4, -0.2, 0.4, -2.1, 1.1];
  return Array.from({ length: count }, (_, index) => base[index % base.length] ?? 0);
}

function buildStableTheme(count: number): MenuTheme {
  return {
    colors: POST_IT_COLORS,
    tilts: buildStableTilts(count),
    tapeTilts: buildStableTapeTilts(count),
  };
}

function buildRandomTheme(count: number): MenuTheme {
  return {
    colors: shuffleColors(POST_IT_COLORS),
    tilts: buildAlternatingTilts(count),
    tapeTilts: buildTapeTilts(count),
  };
}

const clientThemeCache = new Map<string, MenuTheme>();
const serverThemeCache = new Map<string, MenuTheme>();
const subscribeNoop = () => () => {};

function getClientTheme(signature: string, count: number): MenuTheme {
  const cached = clientThemeCache.get(signature);
  if (cached) {
    return cached;
  }

  const nextTheme = buildRandomTheme(count);
  clientThemeCache.set(signature, nextTheme);
  return nextTheme;
}

function getServerTheme(signature: string, count: number): MenuTheme {
  const cached = serverThemeCache.get(signature);
  if (cached) {
    return cached;
  }

  const nextTheme = buildStableTheme(count);
  serverThemeCache.set(signature, nextTheme);
  return nextTheme;
}

export function WorkspaceMenuGrid({
  items,
  cardsLayoutClass,
}: {
  items: WorkspaceMenuItem[];
  cardsLayoutClass: string;
}) {
  const itemsSignature = items.map((item) => `${item.href}:${item.title}`).join("|");
  const theme = useSyncExternalStore(
    subscribeNoop,
    () => getClientTheme(itemsSignature, items.length),
    () => getServerTheme(itemsSignature, items.length),
  );
  const colors = theme.colors;
  const tilts = theme.tilts;
  const tapeTilts = theme.tapeTilts;

  return (
    <section className={`grid w-full mx-auto max-w-[320px] sm:max-w-[380px] md:max-w-4xl lg:max-w-6xl gap-y-12 gap-x-6 md:gap-8 ${cardsLayoutClass}`}>
      {items.map((item, index) => (
        <MenuLink
          key={item.href}
          href={item.href}
          title={item.title}
          color={colors[index % colors.length]}
          tiltDeg={tilts[index] ?? 0}
          tapeTiltDeg={tapeTilts[index] ?? -2}
        />
      ))}
    </section>
  );
}
