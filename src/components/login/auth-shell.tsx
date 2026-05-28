import { KasBrandMark, MonoLabel } from "@/components/primitives";
import { STEP_LABELS, type Step } from "./types";

export function AuthShell({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--kas-ink)" }}>
        <div className="flex items-center gap-2.5">
          <KasBrandMark size={24} />
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 18, letterSpacing: "-0.01em" }}>
            Tauke
          </span>
        </div>
        <MonoLabel size={9}>{STEP_LABELS[step]}</MonoLabel>
      </div>

      <div className="flex items-center gap-2.5 px-5 pt-5">
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>—</span>
        <span className="flex-1" style={{ height: 1, background: "var(--kas-line)" }} />
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
          CV KARYA AGUNG SEJATI
        </span>
      </div>

      {children}
    </div>
  );
}
