"use client";
import { useState } from "react";
import { PROJECTS, fmtIDR } from "@/lib/data";
import { MonoLabel, StatusPill } from "../ui";
import { TopBar, SectionHead, Footer } from "./shared";

function NewProjectModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 480, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>PROYEK BARU</span>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 20px" }}>Buat proyek. <em>Baru.</em></h2>
        <div className="flex flex-col gap-3">
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Nama Proyek</div>
            <input placeholder="Contoh: Atap Beton Perumahan XYZ" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Klien</div>
            <input placeholder="Nama klien atau perusahaan" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Kategori</div>
            <select className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>
              <option value="">— pilih kategori —</option>
              <option>Waterproofing Atap</option>
              <option>Waterproofing Basement</option>
              <option>Waterproofing Kolam</option>
              <option>Waterproofing Fasad</option>
            </select>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Nilai Kontrak (Rp)</div>
            <input placeholder="0" type="number" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Tanggal Mulai</div>
              <input type="date" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Estimasi Selesai</div>
              <input type="date" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 justify-end mt-5">
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
          <button onClick={onClose} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Buat</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsList({ goProject }: { goProject: (id: string) => void }) {
  const [filter, setFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const filtered = PROJECTS.filter((p) => filter === "All" || p.status === filter);

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Proyek" />
      <div className="flex justify-between items-end mb-5">
        <SectionHead no="—" kicker={`${PROJECTS.length} TOTAL`}>Semua proyek, <em>satu daftar.</em></SectionHead>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-3" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 0.5 }}>+</span>
          Proyek Baru
        </button>
      </div>
      <div className="flex" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {["All","Active","On Hold","Completed","Draft"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{ border: "none", background: filter === s ? "var(--kas-ink)" : "transparent", color: filter === s ? "var(--kas-paper)" : "var(--kas-ink-2)", padding: "12px 18px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", borderRight: "1px solid var(--kas-line)" }}>
            {s} · {s === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.status === s).length}
          </button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--kas-ink)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0", width: 40 }}>#</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Proyek</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Klien</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Status</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Nilai</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Sisa</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Progres</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={p.id} onClick={() => goProject(p.id)} style={{ borderBottom: "1px solid var(--kas-line)", cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--kas-paper-2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
              <td style={{ padding: "16px 14px 16px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{String(i + 1).padStart(2, "0")}</td>
              <td style={{ padding: "16px 14px" }}>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{p.code}</div>
              </td>
              <td style={{ padding: "16px 14px" }}>
                <div>{p.client.name}</div>
                <div style={{ fontSize: 11, color: "var(--kas-ink-3)", marginTop: 2 }}>{p.address}</div>
              </td>
              <td style={{ padding: "16px 14px" }}><StatusPill status={p.status} /></td>
              <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace" }}>{fmtIDR(p.contractValue)}</td>
              <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", color: p.contractValue - p.paid > 0 ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>
                {p.contractValue - p.paid > 0 ? fmtIDR(p.contractValue - p.paid) : "—"}
              </td>
              <td style={{ padding: "16px 14px", textAlign: "right" }}>
                <div className="inline-flex items-center gap-2">
                  <div className="relative" style={{ width: 80, height: 4, background: "var(--kas-line-2)" }}>
                    <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
                  </div>
                  <MonoLabel size={11}>{p.progress}%</MonoLabel>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Footer />
      {showNew && <NewProjectModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
