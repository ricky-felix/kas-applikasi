"use client";
import { useState } from "react";
import type { Project } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

type Session = { id: number; projectId: string; in: string; out: string | null };
type State   = { sessions: Session[]; absentProjects: { id: string; reason: string }[]; selectedProjectId: string; photos: number; overtime: number };

const PHASES = [
  { key: "Sebelum", roman: "I"   },
  { key: "Sedang",  roman: "II"  },
  { key: "Sesudah", roman: "III" },
];

export default function LaporanTab({
  myProjects,
  state,
  setState,
  toast,
}: {
  myProjects: Project[];
  state: State;
  setState: (fn: (s: State) => State) => void;
  toast: (m: string) => void;
}) {
  const proj = myProjects[0];

  const [phase, setPhase]               = useState("Sedang");
  const [phaseCounts, setPhaseCounts]   = useState<Record<string, number>>({});
  const [note, setNote]                 = useState("");
  const [reportSent, setReportSent]     = useState(false);
  const [reportProjId, setReportProjId] = useState(myProjects[0]?.id || "");

  if (!proj) return null;

  const selectedPhase = PHASES.find((p) => p.key === phase)!;
  const totalPhotos   = Object.values(phaseCounts).reduce((s, c) => s + c, 0);
  const wordCount     = note.trim() ? note.trim().split(/\s+/).length : 0;

  const handlePhoto = () => {
    setPhaseCounts((prev) => ({ ...prev, [phase]: (prev[phase] || 0) + 1 }));
    setState((s) => ({ ...s, photos: s.photos + 1 }));
    toast(`Foto "${phase}" terkirim.`);
  };

  return (
    <div className="px-5 pt-4 pb-8">
      <Kicker no="03" label="LAPORAN HARIAN" />
      <DisplayHeading size={28}>
        Laporan,<br /><em>harian.</em>
      </DisplayHeading>
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 8, marginBottom: 24 }}>
        {proj.code} · {proj.name}
      </div>

      {/* ── A · Foto Progres ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <MonoLabel size={9}>A · FOTO PROGRES</MonoLabel>
          {totalPhotos > 0 && (
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontWeight: 500, lineHeight: 1 }}>
              {String(totalPhotos).padStart(2, "0")}
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginLeft: 5 }}>FOTO</span>
            </span>
          )}
        </div>

        {/* Phase selector */}
        <div className="flex" style={{ marginBottom: -1 }}>
          {PHASES.map(({ key, roman }, i) => (
            <button
              key={key}
              type="button"
              onClick={() => setPhase(key)}
              className="flex-1 flex flex-col items-center gap-1.5 py-4 relative"
              style={{
                border: "1px solid var(--kas-ink)",
                marginLeft: i > 0 ? -1 : 0,
                background: phase === key ? "var(--kas-ink)" : "var(--kas-paper)",
                color:      phase === key ? "var(--kas-paper)" : "var(--kas-ink)",
                cursor: "pointer",
                zIndex: phase === key ? 1 : 0,
              }}
            >
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontStyle: "italic", lineHeight: 1 }}>{roman}</span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>{key}</span>
              {(phaseCounts[key] || 0) > 0 && (
                <span
                  className="absolute top-2 right-2.5"
                  style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: phase === key ? "rgba(255,255,255,0.5)" : "var(--kas-ochre)" }}
                >
                  {phaseCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Camera button */}
        <button
          type="button"
          onClick={handlePhoto}
          className="w-full flex items-center gap-5 px-5"
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", cursor: "pointer", height: 100 }}
        >
          <div className="grid place-items-center flex-shrink-0" style={{ width: 48, height: 48, border: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="14" />
              <circle cx="12" cy="13" r="3.5" />
              <path d="M8 6l1.5-2h5L16 6" />
            </svg>
          </div>
          <div className="text-left">
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, lineHeight: 1.15, marginBottom: 5 }}>
              Ambil foto <em>{phase.toLowerCase()}.</em>
            </div>
            <MonoLabel size={9}>Fase {selectedPhase.roman} dari III</MonoLabel>
          </div>
        </button>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="my-7" style={{ height: 1, background: "var(--kas-line)" }} />

      {/* ── B · Catatan Harian ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <MonoLabel size={9}>B · CATATAN HARIAN</MonoLabel>
          {wordCount > 0 && (
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}>
              {wordCount} kata
            </span>
          )}
        </div>

        {reportSent ? (
          <div>
            <div className="flex items-start gap-4 px-4 py-4" style={{ background: "var(--kas-moss-soft)", border: "1px solid var(--kas-moss)" }}>
              <span className="inline-block flex-shrink-0" style={{ width: 8, height: 8, background: "var(--kas-moss)", marginTop: 6 }} />
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-moss-ink)", lineHeight: 1.2, marginBottom: 3 }}>
                  Laporan terkirim.
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-moss-ink)", letterSpacing: "0.1em", opacity: 0.65 }}>
                  Diterima oleh Administrasi
                </div>
              </div>
            </div>
            <div className="px-4 py-3" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", borderTop: "none" }}>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, color: "var(--kas-ink-3)", lineHeight: 1.65 }}>
                {note}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {myProjects.length > 1 && (
              <div className="flex overflow-x-auto no-scrollbar" style={{ marginBottom: -1 }}>
                {myProjects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setReportProjId(p.id)}
                    style={{
                      border: "1px solid var(--kas-ink)",
                      marginLeft: i > 0 ? -1 : 0,
                      background: reportProjId === p.id ? "var(--kas-ink)" : "var(--kas-paper)",
                      color:      reportProjId === p.id ? "var(--kas-paper)" : "var(--kas-ink)",
                      padding: "8px 14px",
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                      cursor: "pointer", whiteSpace: "nowrap",
                      zIndex: reportProjId === p.id ? 1 : 0,
                    }}
                  >
                    {p.address}
                  </button>
                ))}
              </div>
            )}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Apa yang dikerjakan hari ini? Contoh: Lapisan ke-2 selesai 25m². Area selatan sudah kering..."
              rows={5}
              className="w-full px-4 py-3.5 resize-none"
              style={{
                border: "1px solid var(--kas-ink)",
                background: "var(--kas-paper)",
                fontFamily: "var(--font-newsreader), serif",
                fontSize: 16, lineHeight: 1.65,
                color: "var(--kas-ink)",
                outline: "none",
                display: "block",
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (!note.trim()) { toast("Isi catatan dulu."); return; }
                toast("Laporan terkirim.");
                setReportSent(true);
              }}
              className="w-full py-4"
              style={{
                border: "none",
                background: note.trim() ? "var(--kas-ink)" : "var(--kas-line)",
                color:      note.trim() ? "var(--kas-paper)" : "var(--kas-ink-3)",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: note.trim() ? "pointer" : "default",
              }}
            >
              Kirim Laporan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
