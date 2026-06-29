"use client";
import { useState } from "react";
import type { Project } from "@/lib/data";
import { Kicker } from "@/components/primitives";

export function DailyReport({ projects, toast }: { projects: Project[]; toast: (m: string) => void }) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [projId, setProjId] = useState(projects[0]?.id || "");

  if (sent) {
    return (
      <div className="mt-5">
        <Kicker no="06" label="LAPORAN HARIAN" />
        <div className="p-4 flex items-center gap-3" style={{ background: "var(--kas-moss-soft)", border: "1px solid var(--kas-line)" }}>
          <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-moss)", flexShrink: 0 }} />
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, color: "var(--kas-moss-ink)" }}>Laporan terkirim ke Administrasi.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <Kicker no="06" label="LAPORAN HARIAN" />
      <div className="p-3.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 6 }}>Ringkasan pekerjaan hari ini</div>
        <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar">
          {projects.map((p) => (
            <button key={p.id} type="button" onClick={() => setProjId(p.id)} style={{ border: `1px solid ${projId === p.id ? "var(--kas-ink)" : "var(--kas-line)"}`, background: projId === p.id ? "var(--kas-ink)" : "var(--kas-paper)", color: projId === p.id ? "var(--kas-paper)" : "var(--kas-ink)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
              {p.address}
            </button>
          ))}
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Lapisan ke-2 selesai 25m². Area selatan sudah kering..." rows={3} className="w-full px-3 py-2.5 resize-none" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, lineHeight: 1.5, color: "var(--kas-ink)" }} />
        <button type="button" onClick={() => { if (!note.trim()) { toast("Isi catatan dulu."); return; } toast("Laporan terkirim."); setSent(true); }} className="w-full mt-2 py-3" style={{ border: "none", background: note.trim() ? "var(--kas-ink)" : "var(--kas-line)", color: note.trim() ? "var(--kas-paper)" : "var(--kas-ink-3)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: note.trim() ? "pointer" : "default" }}>
          Kirim Laporan →
        </button>
      </div>
    </div>
  );
}
