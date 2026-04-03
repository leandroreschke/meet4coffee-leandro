import en from "./messages/en.json";
import es from "./messages/es.json";
import ptBr from "./messages/pt-br.json";

import { SUPPORTED_LOCALES, type Locale } from "@meet4coffee/core";

export type { Locale } from "@meet4coffee/core";

const messages = {
  en,
  es,
  "pt-br": ptBr,
} as const;

export type MessageKey = keyof typeof en;
export type Messages = typeof en;

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) {
    return template;
  }

  return Object.entries(vars).reduce(
    (output, [key, value]) => output.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function normalizeLocale(value?: string | null): Locale {
  if (!value) {
    return "en";
  }

  const lower = value.toLowerCase();
  if (lower === "br" || lower.startsWith("pt")) {
    return "pt-br";
  }

  const match = SUPPORTED_LOCALES.find((locale) => lower.startsWith(locale));
  return match ?? "en";
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function resolveLocale(
  preferredLocale?: string | null,
  workspaceLocale?: string | null,
  browserLocale?: string | null,
): Locale {
  return normalizeLocale(preferredLocale ?? workspaceLocale ?? browserLocale ?? "en");
}

export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
) {
  return interpolate(messages[locale][key], vars);
}

export function createTranslator(locale: Locale) {
  return (key: MessageKey, vars?: Record<string, string | number>) => t(locale, key, vars);
}
