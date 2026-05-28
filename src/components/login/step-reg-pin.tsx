import { useRef } from "react";
import { CODE_LEN } from "./types";
import { CodeBoxes } from "./code-boxes";
import { BackButton, ErrorHint } from "./shared";

export function StepRegPin({
  name,
  pin,
  shake,
  errorMsg,
  isPending,
  onNameChange,
  onPinChange,
  onSubmit,
  onBack,
}: {
  name: string;
  pin: string;
  shake: boolean;
  errorMsg: string | null;
  isPending: boolean;
  onNameChange: (v: string) => void;
  onPinChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const pinRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="px-5 pt-5 pb-2">
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          Buat<br /><em>kode akses.</em>
        </div>
      </div>

      <div className={`px-5 pt-4 pb-3 ${shake ? "animate-kas-shake" : ""}`}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
          Nama lengkap
        </div>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") pinRef.current?.focus(); }}
          placeholder="Nama Anda"
          className="w-full px-3.5 py-3.5 mb-5"
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 16, color: "var(--kas-ink)", outline: "none" }}
        />
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
          Kode akses (6 karakter · huruf &amp; angka)
        </div>
        <CodeBoxes value={pin} length={CODE_LEN} onChange={onPinChange} disabled={isPending} />
        <ErrorHint message={errorMsg} />
      </div>

      <div className="px-5 mt-auto pb-10 flex flex-col gap-3">
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
          <span style={{ fontSize: 12, flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", lineHeight: 1.5 }}>
            Simpan kode akses Anda dengan aman. Jangan bagikan kepada siapapun.
          </span>
        </div>
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="w-full py-4"
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
        >
          {isPending ? "Menyimpan…" : "Selesai & Masuk →"}
        </button>
        <BackButton onClick={onBack} />
      </div>
    </>
  );
}
