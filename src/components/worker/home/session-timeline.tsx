"use client";
import { useProjects } from "@/lib/projects-store";
import { Kicker, MonoLabel } from "@/components/primitives";

type Session = { id: number; projectId: string; in: string; out: string | null; lemburType?: "malam" | "pagi" };

const LEMBUR_LABEL = { malam: "Lembur Malam", pagi: "Lembur Pagi" } as const;

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

function sessionMinutes(inTime: string, outTime: string | null) {
  if (!outTime) return 0;
  return Math.max(0, toMin(outTime) - toMin(inTime));
}

function fmtDurStr(mins: number) {
  return `${Math.floor(mins / 60)}j ${String(mins % 60).padStart(2, "0")}m`;
}

type TimelineEntry = { kind: "session"; s: Session; idx: number };

export function SessionTimeline({
  sessions,
  activeSession,
}: {
  sessions: Session[];
  activeSession: Session | undefined;
}) {
  const PROJECTS = useProjects();
  const totalWorkMin   = sessions.filter((s) => !s.lemburType).reduce((s, x) => s + sessionMinutes(x.in, x.out), 0);
  const totalLemburMin = sessions.filter((s) => s.lemburType).reduce((s, x) => s + sessionMinutes(x.in, x.out), 0);

  const closedSessions = sessions.filter((s) => s.out !== null).sort((a, b) => toMin(a.in) - toMin(b.in));
  const timeline: TimelineEntry[] = closedSessions.map((s, idx) => ({ kind: "session", s, idx }));
  const liveSession = sessions.find((s) => s.out === null);
  if (liveSession) timeline.push({ kind: "session", s: liveSession, idx: closedSessions.length });

  return (
    <div className="mt-5">
      <Kicker no="03" label={`CATATAN WAKTU · ${sessions.length} SESI`} />
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {timeline.map((entry, i) => {
          const { s, idx } = entry;
          const proj = PROJECTS.find((p) => p.id === s.projectId);
          const live = s.out === null;
          const dur  = sessionMinutes(s.in, s.out);
          return (
            <div key={s.id} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="grid gap-3 items-center" style={{ gridTemplateColumns: "auto 1fr auto" }}>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 18, color: live ? "var(--kas-cobalt)" : "var(--kas-ink-3)", minWidth: 24, textAlign: "center" }}>
                  {["I","II","III","IV","V"][idx] || idx + 1}
                </span>
                <div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{proj?.address}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>
                    {s.in} — {s.out ?? "berjalan"}
                    {live && <span style={{ color: "var(--kas-cobalt)", marginLeft: 6 }}>● LIVE</span>}
                    {s.lemburType && <span style={{ color: "var(--kas-ochre)", marginLeft: 6 }}>{LEMBUR_LABEL[s.lemburType].toUpperCase()}</span>}
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: live ? "var(--kas-cobalt)" : "var(--kas-ink)", fontWeight: 500 }}>
                  {live ? "—" : fmtDurStr(dur)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid mt-3" style={{ gridTemplateColumns: `repeat(${totalLemburMin > 0 ? 2 : 1}, 1fr)`, border: "1px solid var(--kas-ink)" }}>
        {[
          { label: "Jam Kerja", value: fmtDurStr(totalWorkMin), color: "var(--kas-ink)" },
          ...(totalLemburMin > 0 ? [{ label: "Lembur", value: fmtDurStr(totalLemburMin), color: "var(--kas-ochre)" }] : []),
        ].map((item, i, arr) => (
          <div key={item.label} className="px-3 py-3" style={{ borderRight: i < arr.length - 1 ? "1px solid var(--kas-line)" : "none" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>{item.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontWeight: 500, marginTop: 4, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-0.5 px-3.5 py-3 flex justify-between items-baseline" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
        <MonoLabel size={10} color="rgba(255,255,255,0.6)">Total di Lokasi</MonoLabel>
        <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>
          {fmtDurStr(totalWorkMin + totalLemburMin)}
        </span>
      </div>
    </div>
  );
}
