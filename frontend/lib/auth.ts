"use client";
import { createClient } from "./supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

function getEmailRedirectTo() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = configured
    ? configured.replace(/\/$/, "")
    : typeof window !== "undefined"
      ? window.location.origin
      : "";

  return baseUrl || undefined;
}

function buildRedirectUrl(pathname: string) {
  const baseUrl = getEmailRedirectTo();
  if (!baseUrl) return undefined;
  return `${baseUrl}${pathname}`;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
) {
  const supabase = createClient();
  const emailRedirectTo = getEmailRedirectTo();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, plan: "free" },
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = createClient();
  const redirectTo = buildRedirectUrl("/auth/reset-password");

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    ...(redirectTo ? { redirectTo } : {}),
  });

  return { data, error };
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  const supabase = createClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);

  return subscription;
}
