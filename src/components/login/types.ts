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
  "Tukang Senior",
  "Tukang Madya",
  "Tukang",
  "Helper",
  "Kepala Proyek",
  "Mandor",
  "Admin",
  "Lainnya",
] as const;

export type Jabatan = (typeof JABATAN_OPTIONS)[number];

// Jabatan that are worker-level (admin approves these; owner/super approve all)
export const WORKER_JABATAN = JABATAN_OPTIONS.filter((j) => j !== "Admin") as readonly string[];
