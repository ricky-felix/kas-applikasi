import { Kicker } from "@/components/primitives";

type LemburSession = { id: number; in: string; out: string | null };

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

function sessionMinutes(inTime: string, outTime: string | null) {
  if (!outTime) return 0;
  return Math.max(0, toMin(outTime) - toMin(inTime));
}

function fmtDurStr(mins: number) {
  return `${Math.floor(mins / 60)}j ${String(mins % 60).padStart(2, "0")}m`;
}

function ClockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="square" />
    </svg>
  );
}

export function LemburSection({
  lemburSessions,
  lemburActive,
  onStart,
  onStop,
}: {
  lemburSessions: LemburSession[];
  lemburActive: LemburSession | undefined;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="mt-5">
      <Kicker no="04" label={`LEMBUR · ${lemburSessions.length} SESI`} />

      {lemburSessions.length > 0 && (
        <div style={{ borderTop: "1px solid var(--kas-ink)", marginBottom: 8 }}>
          {lemburSessions.map((ls, i) => {
            const live = ls.out === null;
            const dur  = sessionMinutes(ls.in, ls.out);
            return (
              <div key={ls.id} className="grid gap-3 items-center py-3" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line)" }}>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 18, color: live ? "var(--kas-ochre)" : "var(--kas-ink-3)", minWidth: 24, textAlign: "center" }}>
                  {["I","II","III","IV","V"][i] || i + 1}
                </span>
                <div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, color: "var(--kas-ochre)" }}>Lembur</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>
                    {ls.in} — {ls.out ?? "berjalan"}
                    {live && <span style={{ color: "var(--kas-ochre)", marginLeft: 6 }}>● LIVE</span>}
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: live ? "var(--kas-ochre)" : "var(--kas-ink)", fontWeight: 500 }}>
                  {live ? "—" : fmtDurStr(dur)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {lemburActive ? (
        <button type="button" onClick={onStop} className="w-full flex items-center justify-center gap-2.5" style={{ border: "none", background: "var(--kas-ochre)", color: "var(--kas-ink)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 22, padding: "18px 14px", cursor: "pointer" }}>
          <ClockIcon size={20} />
          <span>Selesai <em>lembur.</em></span>
        </button>
      ) : (
        <button type="button" onClick={onStart} className="w-full flex items-center justify-center gap-2.5 relative" style={{ border: "1px dashed var(--kas-ochre)", background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 22, padding: "18px 14px", cursor: "pointer" }}>
          <ClockIcon size={20} />
          <span>Mulai <em>lembur.</em></span>
        </button>
      )}
    </div>
  );
}
