"use server";

import { redirect } from "next/navigation";
import { ACCOUNTS } from "@/lib/data";
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

export async function logout(): Promise<never> {
  await clearSession();
  redirect("/");
}
