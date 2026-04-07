"use server";

import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@meet4coffee/supabase";
import type { Locale } from "@meet4coffee/i18n";
import { getCurrentUser } from "@/lib/auth";

export async function setLocaleAction(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "m4c-locale",
    value: locale,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // 1 year
    maxAge: 60 * 60 * 24 * 365,
  });

  const user = await getCurrentUser();
  if (user) {
    const supabase = await createServerSupabaseClient();
    await supabase
      .from("member_profiles")
      .update({ preferred_locale: locale, language: locale })
      .eq("user_id", user.id);
  }
}
