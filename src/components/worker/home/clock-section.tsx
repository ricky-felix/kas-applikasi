import { PROJECTS } from "@/lib/data";
import { Kicker, MonoLabel } from "@/components/primitives";

type Session = { id: number; projectId: string; in: string; out: string | null };

function ClockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="square" />
    </svg>
  );
}

export function ClockSection({
  selectedProj,
  activeSession,
  isAbsent,
  onClockIn,
  onClockOut,
}: {
  selectedProj: typeof PROJECTS[0] | undefined;
  activeSession: Session | undefined;
  isAbsent: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
}) {
  if (!selectedProj) return null;

  const selectedActive   = activeSession && activeSession.projectId === selectedProj.id;
  const someoneElseActive = activeSession && activeSession.projectId !== selectedProj.id;

  if (isAbsent) {
    return (
      <div className="mt-4">
        <Kicker no="02" label={`JAM KERJA · ${selectedProj.address.toUpperCase()}`} />
        <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-ochre)" }} />
            <MonoLabel size={10}>TERCATAT</MonoLabel>
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
            Tidak hadir.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Kicker no="02" label={`JAM KERJA · ${selectedProj.address.toUpperCase()}`} />
      {selectedActive ? (
        <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-cobalt)" }} />
            <MonoLabel size={10}>SEDANG BEKERJA</MonoLabel>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)" }}>
            <div className="py-3.5 pr-3.5" style={{ borderRight: "1px solid var(--kas-line)" }}>
              <MonoLabel size={9}>Jam Masuk</MonoLabel>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em" }}>{activeSession?.in}</div>
            </div>
            <div className="py-3.5 pl-3.5">
              <MonoLabel size={9}>Jam Pulang</MonoLabel>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em", color: "var(--kas-ink-4)" }}>——:——</div>
            </div>
          </div>
          <button type="button" onClick={onClockOut} className="w-full mt-3.5 flex items-center justify-center gap-2.5" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, padding: "20px 14px", cursor: "pointer" }}>
            <ClockIcon />
            <span>Pulang <em>kerja.</em></span>
          </button>
        </div>
      ) : someoneElseActive ? (
        <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
          <MonoLabel size={10}>Sedang aktif di proyek lain</MonoLabel>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, margin: "8px 0 12px" }}>
            Pulang dulu dari <em>{PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}</em>, baru mulai di sini.
          </div>
          <button type="button" onClick={onClockOut} className="w-full" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "14px 12px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Pulang dari {PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}
          </button>
        </div>
      ) : (
        <button type="button" onClick={onClockIn} className="w-full flex items-center justify-center gap-3 relative" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 28, padding: "26px 14px", cursor: "pointer" }}>
          <ClockIcon size={22} />
          <span>Masuk <em>kerja.</em></span>
          <span className="absolute top-2 right-2 inline-block" style={{ width: 8, height: 8, background: "var(--kas-rust)" }} />
        </button>
      )}
    </div>
  );
}
