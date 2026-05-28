import { CODE_LEN } from "./types";
import { CodeBoxes } from "./code-boxes";
import { BackButton, ErrorHint } from "./shared";

export function StepLoginPin({
  pin,
  shake,
  errorMsg,
  isPending,
  onChange,
  onBack,
}: {
  pin: string;
  shake: boolean;
  errorMsg: string | null;
  isPending: boolean;
  onChange: (v: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="px-5 pt-5 pb-2">
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          Kode<br /><em>akses.</em>
        </div>
      </div>

      <div className={`px-5 pt-4 pb-3 ${shake ? "animate-kas-shake" : ""}`}>
        <CodeBoxes value={pin} length={CODE_LEN} autoFocus onChange={onChange} disabled={isPending} />
        <ErrorHint message={errorMsg} />
      </div>

      <div className="px-5 pb-4 mt-auto flex flex-col gap-4">
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: isPending ? "var(--kas-cobalt)" : "var(--kas-ink-3)" }}>
          {isPending ? "Memeriksa…" : "Ketik kode akses 6 karakter — otomatis masuk"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
          <span style={{ fontSize: 12, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", lineHeight: 1.5 }}>
            Jangan bagikan kode akses Anda kepada siapapun, termasuk admin atau atasan.
          </span>
        </div>
        <BackButton onClick={onBack} />
      </div>
    </>
  );
}
