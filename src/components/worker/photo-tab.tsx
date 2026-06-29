"use client";
import { useState } from "react";
import type { Project } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

type Session = { id: number; projectId: string; in: string; out: string | null };
export default function PhotoTab({
  proj,
  state,
  setState,
  toast,
}: {
  proj: Project;
  state: { photos: number };
  setState: (fn: (s: { sessions: Session[]; absentProjects: { id: string; reason: string }[]; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; absentProjects: { id: string; reason: string }[]; selectedProjectId: string; photos: number; overtime: number }) => void;
  toast: (m: string) => void;
}) {
  const [phase, setPhase] = useState("Sedang");

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="UPLOAD FOTO PROGRES" />
      <DisplayHeading size={28}>
        Foto,<br /><em>tiga fase.</em>
      </DisplayHeading>
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 12 }}>
        {proj.code} · {proj.name}
      </div>

      <div className="mt-4">
        <Kicker no="02" label="PILIH FASE" />
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {["Sebelum", "Sedang", "Sesudah"].map((p, i) => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              className="flex flex-col items-center gap-1 py-3.5"
              style={{
                border: "1px solid var(--kas-ink)",
                background: phase === p ? "var(--kas-ink)" : "var(--kas-paper)",
                color: phase === p ? "var(--kas-paper)" : "var(--kas-ink)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontStyle: "italic", opacity: 0.7 }}>
                {["I", "II", "III"][i]}
              </span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {p}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Kicker no="03" label="AMBIL FOTO" />
        <button
          onClick={() => {
            setState((s) => ({ ...s, photos: s.photos + 1 }));
            toast(`Foto "${phase}" terkirim.`);
          }}
          className="w-full flex flex-col items-center gap-3 py-8"
          style={{ border: "1px dashed var(--kas-ink)", background: "var(--kas-paper-2)", cursor: "pointer" }}
        >
          <div className="grid place-items-center" style={{ width: 56, height: 56, border: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="14" /><circle cx="12" cy="13" r="3.5" /><path d="M8 6l1.5-2h5L16 6" />
            </svg>
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20 }}>Buka kamera</div>
          <MonoLabel size={10}>Fase: {phase}</MonoLabel>
        </button>
      </div>

      <div className="mt-4 px-3.5 py-3 flex justify-between items-center" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <MonoLabel size={10}>Hari ini terkirim</MonoLabel>
        <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500 }}>
          {String(state.photos).padStart(2, "0")}{" "}
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>FOTO</span>
        </span>
      </div>
    </div>
  );
}
