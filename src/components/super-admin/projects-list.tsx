"use client";
import { useState } from "react";
import { fmtIDR, fmtIDRshort, type Project } from "@/lib/data";
import { useProjects, addProject, nextProjectCode } from "@/lib/projects-store";
import { MonoLabel, StatusPill } from "@/components/primitives";
import { TopBar, SectionHead, Footer } from "./shared";

const CATEGORIES = [
  "Waterproofing Atap",
  "Waterproofing Basement",
  "Waterproofing Kolam",
  "Waterproofing Fasad",
  "Waterproofing Lantai",
  "Lainnya",
];

const STATUSES: { k: Project["status"]; l: string }[] = [
  { k: "Active", l: "Aktif" },
  { k: "On Hold", l: "Ditahan" },
  { k: "Completed", l: "Selesai" },
  { k: "Draft", l: "Draf" },
];

type NewForm = {
  name: string;
  clientName: string;
  clientPhone: string;
  address: string;
  category: string;
  status: Project["status"];
  start: string;
  endEst: string;
  contractValue: number;
  summary: string;
};

const EMPTY_FORM: NewForm = {
  name: "", clientName: "", clientPhone: "", address: "",
  category: "", status: "Draft", start: "", endEst: "",
  contractValue: 0, summary: "",
};

const labelStyle = { fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--kas-ink-3)", marginBottom: 4 };
const inputStyle = { border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, outline: "none" };

function NewProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Project) => void }) {
  const [form, setForm] = useState<NewForm>(EMPTY_FORM);
  const set = <K extends keyof NewForm>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: k === "contractValue" ? Number(e.target.value) : e.target.value }));

  const canSubmit = form.name.trim() && form.clientName.trim() && form.category && form.contractValue > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const code = nextProjectCode();
    const newProj: Project = {
      id: `p-${Date.now()}`,
      code,
      slug: code.toLowerCase().replace(/-/g, ""),
      name: form.name.trim(),
      client: { name: form.clientName.trim(), phone: form.clientPhone.trim() || "—", address: form.address.trim() || "—" },
      address: form.address.trim() || form.clientName.trim(),
      category: form.category,
      status: form.status,
      start: form.start || "—",
      endEst: form.endEst || "—",
      progress: 0,
      contractValue: form.contractValue,
      paid: 0,
      summary: form.summary.trim() || "Belum ada catatan internal untuk proyek ini.",
      daysRunning: 0,
      photos: 0,
      assigned: [],
      activity: [],
    };
    onCreate(newProj);
  };

  return (
    <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 480, maxHeight: "88vh", overflowY: "auto", background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>PROYEK BARU</span>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 20px" }}>Buat proyek. <em>Baru.</em></h2>
        <div className="flex flex-col gap-3">
          <div>
            <div style={labelStyle}>Nama Proyek *</div>
            <input value={form.name} onChange={set("name")} placeholder="Contoh: Atap Beton Perumahan XYZ" className="w-full px-3 py-2.5" style={inputStyle} />
          </div>
          <div>
            <div style={labelStyle}>Klien *</div>
            <input value={form.clientName} onChange={set("clientName")} placeholder="Nama klien atau perusahaan" className="w-full px-3 py-2.5" style={inputStyle} />
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <div style={labelStyle}>No. Telepon</div>
              <input value={form.clientPhone} onChange={set("clientPhone")} placeholder="+62 812 xxxx xxxx" className="w-full px-3 py-2.5" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>Lokasi / Alamat</div>
              <input value={form.address} onChange={set("address")} placeholder="Cemara Asri Blok C5, Medan" className="w-full px-3 py-2.5" style={inputStyle} />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Kategori *</div>
            <select value={form.category} onChange={set("category")} className="w-full px-3 py-2.5" style={inputStyle}>
              <option value="">— pilih kategori —</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={labelStyle}>Status Awal</div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {STATUSES.map((s) => (
                <button key={s.k} type="button" onClick={() => setForm((f) => ({ ...f, status: s.k }))}
                  style={{ border: `1px solid ${form.status === s.k ? "var(--kas-ink)" : "var(--kas-line)"}`, background: form.status === s.k ? "var(--kas-ink)" : "transparent", color: form.status === s.k ? "var(--kas-paper)" : "var(--kas-ink-3)", padding: "8px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                  {s.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Nilai Kontrak (Rp) *</div>
            <input value={form.contractValue || ""} onChange={set("contractValue")} placeholder="0" type="number" min="0" className="w-full px-3 py-2.5" style={inputStyle} />
            {form.contractValue > 0 && (
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{fmtIDRshort(form.contractValue)}</div>
            )}
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <div style={labelStyle}>Tanggal Mulai</div>
              <input value={form.start} onChange={set("start")} type="date" className="w-full px-3 py-2.5" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>Estimasi Selesai</div>
              <input value={form.endEst} onChange={set("endEst")} type="date" className="w-full px-3 py-2.5" style={inputStyle} />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Catatan Internal</div>
            <textarea value={form.summary} onChange={set("summary")} rows={3} placeholder="Ringkasan singkat: kondisi, akses lokasi, permintaan klien…" className="w-full px-3 py-2.5" style={{ ...inputStyle, fontFamily: "var(--font-newsreader), serif", fontSize: 15, resize: "vertical" }} />
          </div>
        </div>
        <div className="flex gap-2.5 justify-end mt-5">
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
          <button onClick={handleSubmit} disabled={!canSubmit} style={{ background: canSubmit ? "var(--kas-ink)" : "var(--kas-line)", color: canSubmit ? "var(--kas-paper)" : "var(--kas-ink-3)", border: "none", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: canSubmit ? "pointer" : "default" }}>Buat</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsList({ goProject }: { goProject: (id: string) => void }) {
  const projects = useProjects();
  const [filter, setFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const filtered = projects.filter((p) => filter === "All" || p.status === filter);

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Proyek" />
      <div className="flex justify-between items-end mb-5">
        <SectionHead no="—" kicker={`${projects.length} TOTAL`}>Semua proyek, <em>satu daftar.</em></SectionHead>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-3" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 0.5 }}>+</span>
          Proyek Baru
        </button>
      </div>
      <div className="flex" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {["All","Active","On Hold","Completed","Draft"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{ border: "none", background: filter === s ? "var(--kas-ink)" : "transparent", color: filter === s ? "var(--kas-paper)" : "var(--kas-ink-2)", padding: "12px 18px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", borderRight: "1px solid var(--kas-line)" }}>
            {s} · {s === "All" ? projects.length : projects.filter((p) => p.status === s).length}
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
      {showNew && (
        <NewProjectModal
          onClose={() => setShowNew(false)}
          onCreate={(p) => { addProject(p); setShowNew(false); goProject(p.id); }}
        />
      )}
    </div>
  );
}
