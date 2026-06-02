export type Step =
  | "phone"
  | "pin"
  | "reg-phone"
  | "reg-pin"
  | "reg-profile"
  | "reg-pending";

export const STEP_LABELS: Record<Step, string> = {
  "phone":       "01 · NOMOR HP",
  "pin":         "02 · KODE AKSES",
  "reg-phone":   "01 · NOMOR HP",
  "reg-pin":     "02 · KODE AKSES",
  "reg-profile": "03 · PROFIL",
  "reg-pending": "04 · MENUNGGU",
};

export const CODE_LEN = 6;

export type Gender = "L" | "P";

export const JABATAN_OPTIONS = [
  "Tukang Junior",
  "Tukang",
  "Tukang Senior",
  "Administrasi",
] as const;

export type Jabatan = (typeof JABATAN_OPTIONS)[number];

// Jabatan that are worker-level (admin approves these; owner/super approve all)
export const WORKER_JABATAN = JABATAN_OPTIONS.filter((j) => j !== "Administrasi") as readonly string[];

// How a self-registered jabatan maps to an app role (and therefore which screen
// the account lands on after login):
//   • any "Tukang …" → "worker"  → worker page
//   • "Administrasi"  → "admin"   → admin page
// Owner, Super Admin and other technical positions (Business Analyst, Product
// Manager, IT Staff, dsb.) are NOT self-registerable — they are inserted
// manually into the database, so they never appear in JABATAN_OPTIONS.
export type AppRole = "worker" | "admin";
export function jabatanToRole(jabatan: string): AppRole {
  return jabatan === "Administrasi" ? "admin" : "worker";
}
