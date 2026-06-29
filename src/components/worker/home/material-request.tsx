"use client";
import { useState } from "react";
import type { Project } from "@/lib/data";
import { useMaterials } from "@/lib/stores";
import { Kicker } from "@/components/primitives";

export function MaterialRequest({ projects, toast }: { projects: Project[]; toast: (m: string) => void }) {
  const MATERIALS = useMaterials();
  const [open, setOpen] = useState(false);
  const [projId, setProjId] = useState(projects[0]?.id || "");
  const [matId, setMatId] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const mat = MATERIALS.find((m) => m.id === matId);

  return (
    <div className="mt-5">
      <div className="flex justify-between items-center mb-2">
        <Kicker no="07" label="PERMINTAAN MATERIAL" />
      </div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center justify-between px-3.5 py-3.5" style={{ border: "1px dashed var(--kas-line)", background: "var(--kas-paper)", cursor: "pointer" }}>
          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>Minta material ke gudang</span>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-ink-3)" }}>→</span>
        </button>
      ) : (
        <div className="p-3.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 8 }}>Form Permintaan Material</div>
          <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
            {projects.map((p) => (
              <button key={p.id} type="button" onClick={() => setProjId(p.id)} style={{ border: `1px solid ${projId === p.id ? "var(--kas-ink)" : "var(--kas-line)"}`, background: projId === p.id ? "var(--kas-ink)" : "var(--kas-paper)", color: projId === p.id ? "var(--kas-paper)" : "var(--kas-ink)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
                {p.address}
              </button>
            ))}
          </div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Pilih Material</div>
          <select value={matId} onChange={(e) => setMatId(e.target.value)} className="w-full px-3 py-2.5 mb-2" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink)" }}>
            <option value="">— pilih material —</option>
            {MATERIALS.map((m) => <option key={m.id} value={m.id}>{m.name} (stok: {m.stock} {m.unit})</option>)}
          </select>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Jumlah {mat ? `(${mat.unit})` : ""}</div>
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" type="number" className="w-full px-3 py-2.5 mb-2" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 14 }} />
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Catatan (opsional)</div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Untuk area / keperluan apa?" className="w-full px-3 py-2.5 mb-3" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }} />
          <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button type="button" onClick={() => setOpen(false)} style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Batal</button>
            <button type="button" onClick={() => { if (!matId || !qty) { toast("Pilih material dan jumlah."); return; } toast(`Permintaan ${mat?.name} dikirim ke admin.`); setOpen(false); setMatId(""); setQty(""); setNote(""); }} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Kirim →</button>
          </div>
        </div>
      )}
    </div>
  );
}
