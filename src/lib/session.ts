import { cookies } from "next/headers";
import type { Account } from "./data";

const COOKIE = "kas-session";

export async function getSession(): Promise<Account | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try { return JSON.parse(raw) as Account; }
  catch { return null; }
}

export async function setSession(acct: Account): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(acct), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export function roleToPath(role: Account["role"]): string {
  return { super_admin: "/super-admin", owner: "/owner", admin: "/admin", worker: "/worker" }[role];
}
