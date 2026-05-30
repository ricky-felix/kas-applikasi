import { CODE_LEN } from "./types";
import { CodeBoxes } from "./code-boxes";
import { BackButton, ErrorHint, RegStepper } from "./shared";

export function StepRegPin({
  pin,
  remember,
  shake,
  errorMsg,
  isPending,
  onPinChange,
  onRememberChange,
  onSubmit,
  onBack,
}: {
  pin: string;
  remember: boolean;
  shake: boolean;
  errorMsg: string | null;
  isPending: boolean;
  onPinChange: (v: string) => void;
  onRememberChange: (v: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const ready = pin.length === CODE_LEN;

  return (
    <>
      <RegStepper current={2} />
      <div className="px-5 pb-2">
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          Buat<br /><em>kode akses.</em>
        </div>
      </div>

      <div className={`px-5 pt-4 pb-3 ${shake ? "animate-kas-shake" : ""}`}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
          Kode akses (6 karakter · huruf &amp; angka)
        </div>
        <CodeBoxes value={pin} length={CODE_LEN} autoFocus onChange={onPinChange} disabled={isPending} />
        <ErrorHint message={errorMsg} />

        <button
          type="button"
          onClick={() => onRememberChange(!remember)}
          className="flex items-center gap-2.5 mt-4"
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 16, height: 16, flexShrink: 0,
            border: `1px solid ${remember ? "var(--kas-ink)" : "var(--kas-line)"}`,
            background: remember ? "var(--kas-ink)" : "transparent",
            color: "var(--kas-paper)",
            fontSize: 10,
          }}>
            {remember ? "✓" : ""}
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
            Simpan di perangkat ini
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", marginTop: 12 }}>
          <span style={{ fontSize: 12, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", lineHeight: 1.5 }}>
            Simpan kode akses Anda dengan aman. Jangan bagikan kepada siapapun.
          </span>
        </div>
      </div>

      <div className="px-5 pb-6 flex flex-col gap-3">
        <button
          onClick={onSubmit}
          disabled={!ready || isPending}
          className="w-full py-4"
          style={{ border: "none", background: ready ? "var(--kas-ink)" : "var(--kas-line)", color: ready ? "var(--kas-paper)" : "var(--kas-ink-3)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: ready ? "pointer" : "default" }}
        >
          {isPending ? "Menyimpan…" : "Lanjut →"}
        </button>
        <BackButton onClick={onBack} />
      </div>
    </>
  );
}
