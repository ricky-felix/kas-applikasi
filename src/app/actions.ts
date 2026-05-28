"use server";

import { redirect } from "next/navigation";
import { ACCOUNTS } from "@/lib/data";
import type { Account } from "@/lib/data";
import { setSession, clearSession, roleToPath } from "@/lib/session";

export async function login(
  phone: string,
  pin: string
): Promise<{ error: true } | never> {
  const acct = ACCOUNTS.find((a) => a.phone === phone && a.pin === pin);
  if (!acct) return { error: true };
  await setSession(acct);
  redirect(roleToPath(acct.role));
}

export async function loginWithPin(
  pin: string
): Promise<{ error: string } | never> {
  const acct = ACCOUNTS.find((a) => a.pin === pin.toUpperCase());
  if (!acct) return { error: "Kode akses tidak ditemukan." };
  await setSession(acct);
  redirect(roleToPath(acct.role));
}

// Demo stubs — no real SMS or DB
export async function registerSendOtp(
  _phone: string
): Promise<{ ok: true }> {
  return { ok: true };
}

export async function registerVerifyOtp(
  _phone: string,
  _otp: string
): Promise<{ ok: true }> {
  return { ok: true };
}

export async function registerSetPin(
  phone: string,
  name: string,
  pin: string
): Promise<{ error: string } | never> {
  if (!name.trim() || pin.length < 6) return { error: "Data tidak lengkap." };
  const short = name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "PK";
  const acct: Account = { phone, pin: pin.toUpperCase(), role: "worker", name: name.trim(), short };
  await setSession(acct);
  redirect(roleToPath("worker"));
}

export async function logout(): Promise<never> {
  await clearSession();
  redirect("/");
}
