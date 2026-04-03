import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@meet4coffee/supabase";
import { type Locale } from "@meet4coffee/i18n";

import { localizePath, stripLocalePrefix } from "@/lib/locale";

const AUTH_PATHS = ["/sign-in", "/sign-up", "/magic-link"];
const APP_PATHS = ["/app", "/w/", "/setup", "/welcome"];

function isProtectedAppPath(pathname: string) {
  return APP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

type CookieOptions = NonNullable<Parameters<NextResponse["cookies"]["set"]>[2]>;
type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

async function refreshSession(request: NextRequest) {
  const env = getSupabaseEnv();

  if (!env.url || !env.anonKey) {
    return { response: NextResponse.next({ request }), user: null };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
        }

        response = NextResponse.next({ request });

        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

function withLocalePrefix(path: string, locale: Locale | null) {
  if (!locale) {
    return path;
  }

  return localizePath(path, locale);
}

export async function proxy(request: NextRequest) {
  const { response, user } = await refreshSession(request);
  const pathname = request.nextUrl.pathname;
  const { locale, pathnameWithoutLocale } = stripLocalePrefix(pathname);
  const appPathname = pathnameWithoutLocale;

  if (!user && isProtectedAppPath(appPathname)) {
    return NextResponse.redirect(new URL(withLocalePrefix("/sign-in", locale), request.url));
  }

  if (user && AUTH_PATHS.some((path) => appPathname.startsWith(path))) {
    return NextResponse.redirect(new URL(withLocalePrefix("/app", locale), request.url));
  }

  if (locale) {
    response.cookies.set("m4c-locale", locale, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }

  if (locale && pathnameWithoutLocale !== pathname) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathnameWithoutLocale;
    const rewritten = NextResponse.rewrite(rewriteUrl);
    const refreshCookies = response.cookies.getAll();
    for (const cookie of refreshCookies) {
      rewritten.cookies.set(cookie.name, cookie.value, cookie);
    }
    if (locale) {
      rewritten.cookies.set("m4c-locale", locale, {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
    }
    return rewritten;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
