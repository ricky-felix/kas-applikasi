export type Step = "choose" | "login-pin" | "reg-phone" | "reg-otp" | "reg-pin";

export const STEP_LABELS: Record<Step, string> = {
  "choose":    "01 · MASUK / DAFTAR",
  "login-pin": "01 · KODE AKSES",
  "reg-phone": "01 · NOMOR HP",
  "reg-otp":   "02 · VERIFIKASI",
  "reg-pin":   "03 · BUAT KODE AKSES",
};

export const CODE_LEN = 6;
