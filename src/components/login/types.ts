export type Step = "phone" | "pin";

export const STEP_LABELS: Record<Step, string> = {
  "phone": "01 · NOMOR HP",
  "pin":   "02 · KODE AKSES",
};

export const CODE_LEN = 6;
