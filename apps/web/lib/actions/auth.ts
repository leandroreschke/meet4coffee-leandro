"use server";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@meet4coffee/supabase";

import { getAppUrl } from "../env";

function redirectWithError(path: string, message: string) {
  const params = new URLSearchParams({ error: message });
  redirect(`${path}?${params.toString()}`);
}

function getNextPath(formData: FormData) {
  const next = String(formData.get("next") ?? "").trim();
  return next.startsWith("/") ? next : "/app";
}

export async function signInAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const next = getNextPath(formData);

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithError("/sign-in", error.message);
  }

  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const next = getNextPath(formData);
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password !== confirmPassword) {
    redirectWithError("/sign-up", "Passwords do not match.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectWithError("/sign-up", error.message);
  }

  redirect(next);
}

export async function magicLinkAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const next = getNextPath(formData);
  const email = String(formData.get("email") ?? "");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectWithError("/magic-link", error.message);
  }

  redirect(`/sign-in?magic=sent&next=${encodeURIComponent(next)}`);
}

export async function googleAuthAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const next = getNextPath(formData);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectWithError("/sign-in", error.message);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/sign-in");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
