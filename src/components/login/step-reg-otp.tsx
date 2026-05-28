import { fmtPhone } from "@/lib/data";
import { CODE_LEN } from "./types";
import { CodeBoxes } from "./code-boxes";
import { BackButton, ErrorHint } from "./shared";

export function StepRegOtp({
  phone,
  otp,
  shake,
  errorMsg,
  isPending,
  onChange,
  onBack,
}: {
  phone: string;
  otp: string;
  shake: boolean;
  errorMsg: string | null;
  isPending: boolean;
  onChange: (v: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="px-5 pt-5 pb-2">
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          Kode OTP<br />
          <span style={{ color: "var(--kas-ink-3)", fontSize: 22 }}>+62 {fmtPhone(phone)}</span>
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ochre)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 8 }}>
          Demo · masukkan angka apa saja
        </div>
      </div>

      <div className={`px-5 pt-4 pb-3 ${shake ? "animate-kas-shake" : ""}`}>
        <CodeBoxes value={otp} length={CODE_LEN} numeric autoFocus onChange={onChange} disabled={isPending} />
        <ErrorHint message={errorMsg} />
      </div>

      <div className="px-5 mt-auto pb-10 flex flex-col gap-3">
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: isPending ? "var(--kas-cobalt)" : "var(--kas-ink-3)" }}>
          {isPending ? "Memverifikasi…" : "Masukkan 6 digit OTP"}
        </div>
        <BackButton label="← Ganti nomor" onClick={onBack} />
      </div>
    </>
  );
}
