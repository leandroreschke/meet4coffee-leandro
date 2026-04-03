import { normalizeLocale, type Locale } from "@meet4coffee/i18n";

const PATH_SEGMENT_TO_LOCALE = {
  en: "en",
  es: "es",
  br: "pt-br",
} as const satisfies Record<string, Locale>;

const LOCALE_TO_PATH_SEGMENT: Record<Locale, keyof typeof PATH_SEGMENT_TO_LOCALE> = {
  en: "en",
  es: "es",
  "pt-br": "br",
};

export function localeToPathSegment(locale: Locale) {
  return LOCALE_TO_PATH_SEGMENT[normalizeLocale(locale)];
}

export function pathSegmentToLocale(segment?: string | null): Locale | null {
  if (!segment) {
    return null;
  }

  return PATH_SEGMENT_TO_LOCALE[segment.toLowerCase() as keyof typeof PATH_SEGMENT_TO_LOCALE] ?? null;
}

export function stripLocalePrefix(pathname: string): {
  locale: Locale | null;
  pathnameWithoutLocale: string;
} {
  const [firstSegment, ...rest] = pathname.split("/");
  const segment = firstSegment ? firstSegment : rest.shift();
  const locale = pathSegmentToLocale(segment);

  if (!locale) {
    return {
      locale: null,
      pathnameWithoutLocale: pathname,
    };
  }

  const nextPath = `/${rest.join("/")}`.replace(/\/+/g, "/");
  return {
    locale,
    pathnameWithoutLocale: nextPath === "/" ? "/" : nextPath.replace(/\/$/, "") || "/",
  };
}

export function localizePath(path: string, locale: Locale) {
  if (!path.startsWith("/")) {
    return path;
  }

  const { pathnameWithoutLocale } = stripLocalePrefix(path);
  const segment = localeToPathSegment(locale);

  if (pathnameWithoutLocale === "/") {
    return `/${segment}`;
  }

  return `/${segment}${pathnameWithoutLocale}`;
}

export function toIntlLocale(locale: Locale) {
  if (locale === "pt-br") {
    return "pt-BR";
  }

  if (locale === "es") {
    return "es-ES";
  }

  return "en-US";
}
