import { CODE_LEN } from "./types";
import { CodeBoxes } from "./code-boxes";
import { BackButton, ErrorHint } from "./shared";

export function StepLoginPin({
  phone,
  pin,
  shake,
  errorMsg,
  isPending,
  rememberMe,
  onRememberMe,
  onChange,
  onBack,
}: {
  phone: string;
  pin: string;
  shake: boolean;
  errorMsg: string | null;
  isPending: boolean;
  rememberMe: boolean;
  onRememberMe: (v: boolean) => void;
  onChange: (v: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="px-5 pt-5 pb-2">
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          Kode<br /><em>akses.</em>
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.12em", marginTop: 8 }}>
          {phone}
        </div>
      </div>

      <div className={`px-5 pt-4 pb-3 ${shake ? "animate-kas-shake" : ""}`}>
        <CodeBoxes value={pin} length={CODE_LEN} autoFocus onChange={onChange} disabled={isPending} />
        <ErrorHint message={errorMsg} />

        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: isPending ? "var(--kas-cobalt)" : "var(--kas-ink-3)", marginTop: 10 }}>
          {isPending ? "Memeriksa…" : "Ketik kode akses 6 karakter — otomatis masuk"}
        </div>

        <button
          type="button"
          onClick={() => onRememberMe(!rememberMe)}
          className="flex items-center gap-2.5 mt-4"
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 16, height: 16, flexShrink: 0,
            border: `1px solid ${rememberMe ? "var(--kas-ink)" : "var(--kas-line)"}`,
            background: rememberMe ? "var(--kas-ink)" : "transparent",
            color: "var(--kas-paper)",
            fontSize: 10,
          }}>
            {rememberMe ? "✓" : ""}
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
            Akses cepat — simpan di perangkat ini
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", marginTop: 12 }}>
          <span style={{ fontSize: 12, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", lineHeight: 1.5 }}>
            Jangan bagikan kode akses Anda kepada siapapun.
          </span>
        </div>
      </div>

      <div className="px-5 pb-4">
        <BackButton onClick={onBack} />
      </div>
    </>
  );
}
