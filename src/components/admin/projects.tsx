"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, fmtIDRshort, type Project } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

const CATEGORIES = [
  "Waterproofing Atap",
  "Waterproofing Basement",
  "Waterproofing Kolam",
  "Waterproofing Fasad",
  "Waterproofing Lantai",
  "Lainnya",
];

const STATUS_MAP = {
  Active:    { label: "Aktif",    bg: "var(--kas-cobalt-soft)", color: "var(--kas-cobalt-ink)" },
  "On Hold": { label: "Ditahan", bg: "var(--kas-ochre-soft)",  color: "var(--kas-ochre-ink)"  },
  Completed: { label: "Selesai", bg: "var(--kas-moss-soft)",   color: "var(--kas-moss-ink)"   },
  Draft:     { label: "Draf",    bg: "var(--kas-paper-2)",     color: "var(--kas-ink-3)"      },
};

type NewProject = Pick<Project,
  "name" | "category" | "address" | "status" | "start" | "endEst" | "contractValue"
> & { clientName: string; clientPhone: string };

const EMPTY_FORM: NewProject = {
  name: "", category: "", address: "", status: "Draft",
  start: "", endEst: "", contractValue: 0,
  clientName: "", clientPhone: "",
};

function nextCode(existing: Project[]) {
  const max = existing.reduce((n, p) => {
    const m = p.code.match(/KAS-\d{4}-(\d+)/);
    return m ? Math.max(n, parseInt(m[1])) : n;
  }, 0);
  return `KAS-2026-${String(max + 1).padStart(3, "0")}`;
}

type StatusFilter = "all" | Project["status"];

export default function AMProjects({ toast }: { toast: (m: string) => void }) {
  const [extra, setExtra]             = useState<Project[]>([]);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState<NewProject>(EMPTY_FORM);
  const [detailId, setDetailId]       = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allProjects    = [...extra, ...PROJECTS];
  const detail         = allProjects.find((p) => p.id === detailId);
  const filteredProjects = allProjects.filter((p) => statusFilter === "all" || p.status === statusFilter);

  const field = (k: keyof NewProject) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: k === "contractValue" ? Number(e.target.value) : e.target.value }));

  const canSubmit = form.name.trim() && form.clientName.trim() && form.category && form.contractValue > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const code = nextCode(allProjects);
    const newProj: Project = {
      id:            `p-${Date.now()}`,
      code,
      slug:          code.toLowerCase().replace(/-/g, ""),
      name:          form.name.trim(),
      client:        { name: form.clientName.trim(), phone: form.clientPhone.trim(), address: form.address.trim() },
      address:       form.address.trim() || form.clientName.trim(),
      category:      form.category,
      status:        form.status,
      start:         form.start || "—",
      endEst:        form.endEst || "—",
      progress:      0,
      contractValue: form.contractValue,
      paid:          0,
      assigned:      [],
      activity:      [],
    };
    setExtra((prev) => [newProj, ...prev]);
    toast(`Proyek ${newProj.code} ditambahkan.`);
    setShowForm(false);
    setForm(EMPTY_FORM);
  };

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (detail) {
    const st       = STATUS_MAP[detail.status];
    const sisa     = detail.contractValue - detail.paid;
    const assigned = WORKERS.filter((w) => detail.assigned.includes(w.id));
    return (
      <div className="px-5 pt-4 pb-6">
        <button
          onClick={() => setDetailId(null)}
          style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 12px" }}
        >
          ← Semua Proyek
        </button>

        <div className="flex items-start justify-between gap-2 mb-1">
          <MonoLabel size={10}>{detail.code}</MonoLabel>
          <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: st.bg, color: st.color, border: "1px solid var(--kas-line)", flexShrink: 0 }}>
            {st.label}
          </span>
        </div>
        <DisplayHeading size={26}>{detail.name}</DisplayHeading>

        <div className="mt-4 flex flex-col" style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {[
            { l: "Klien",        v: detail.client.name },
            { l: "Lokasi",       v: detail.address      },
            { l: "Kategori",     v: detail.category     },
            { l: "Mulai",        v: detail.start        },
            { l: "Est. Selesai", v: detail.endEst       },
          ].map((r, i) => (
            <div key={i} className="grid gap-3 py-3" style={{ gridTemplateColumns: "100px 1fr", borderBottom: "1px solid var(--kas-line-2)" }}>
              <MonoLabel size={9}>{r.l}</MonoLabel>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{r.v}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <MonoLabel size={9}>Progres</MonoLabel>
            <MonoLabel size={9}>{detail.progress}%</MonoLabel>
          </div>
          <div className="relative" style={{ height: 6, background: "var(--kas-line-2)" }}>
            <div className="absolute inset-y-0 left-0" style={{ width: `${detail.progress}%`, background: "var(--kas-ink)" }} />
          </div>
        </div>

        <div className="mt-4 grid" style={{ gridTemplateColumns: "1fr 1fr", border: "1px solid var(--kas-ink)" }}>
          {[
            { l: "Nilai Kontrak", v: fmtIDRshort(detail.contractValue) },
            { l: "Sisa Tagihan",  v: sisa > 0 ? fmtIDRshort(sisa) : "Lunas" },
          ].map((c, i) => (
            <div key={i} className="px-3 py-3" style={{ borderRight: i === 0 ? "1px solid var(--kas-line)" : "none" }}>
              <MonoLabel size={9}>{c.l}</MonoLabel>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, fontWeight: 500, marginTop: 4, color: i === 1 && sisa > 0 ? "var(--kas-rust)" : "var(--kas-ink)" }}>{c.v}</div>
            </div>
          ))}
        </div>

        {assigned.length > 0 && (
          <div className="mt-4">
            <Kicker no="—" label={`${assigned.length} PEKERJA DITUGASKAN`} />
            <div style={{ borderTop: "1px solid var(--kas-line)" }}>
              {assigned.map((w) => (
                <div key={w.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                  <div className="grid place-items-center" style={{ width: 30, height: 30, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 12, flexShrink: 0 }}>{w.short}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>{w.role}{w.isKepalaProyek ? " · Kepala Proyek" : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="02" label={`${allProjects.length} TOTAL`} />
      <div className="flex justify-between items-baseline">
        <DisplayHeading size={28}>Proyek,<br /><em>semua.</em></DisplayHeading>
        <button
          onClick={() => setShowForm(true)}
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 14px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}
        >
          + Baru
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 mt-4 overflow-x-auto no-scrollbar">
        {([
          { k: "all",       l: "Semua"   },
          { k: "Active",    l: "Aktif"   },
          { k: "On Hold",   l: "Ditahan" },
          { k: "Completed", l: "Selesai" },
          { k: "Draft",     l: "Draf"    },
        ] as { k: StatusFilter; l: string }[]).map((f) => {
          const count = f.k === "all" ? allProjects.length : allProjects.filter((p) => p.status === f.k).length;
          const st    = f.k !== "all" ? STATUS_MAP[f.k as Project["status"]] : null;
          return (
            <button
              key={f.k}
              type="button"
              onClick={() => setStatusFilter(f.k)}
              style={{
                border: `1px solid ${statusFilter === f.k ? "var(--kas-ink)" : "var(--kas-line)"}`,
                background: statusFilter === f.k ? (st ? st.bg : "var(--kas-ink)") : "var(--kas-paper)",
                color:      statusFilter === f.k ? (st ? st.color : "var(--kas-paper)") : "var(--kas-ink-3)",
                padding: "5px 12px",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {f.l} {count > 0 && <span style={{ opacity: 0.6 }}>· {count}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-3" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {filteredProjects.length === 0 ? (
          <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Tidak ada proyek
          </div>
        ) : null}
        {filteredProjects.map((p) => {
          const st   = STATUS_MAP[p.status];
          const sisa = p.contractValue - p.paid;
          const isNew = extra.some((e) => e.id === p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setDetailId(p.id)}
              className="w-full text-left py-4"
              style={{ border: "none", borderBottom: "1px solid var(--kas-line)", background: "transparent", cursor: "pointer", display: "block" }}
            >
              <div className="flex justify-between items-baseline">
                <MonoLabel size={10}>{p.code}</MonoLabel>
                <div className="flex items-center gap-1.5">
                  {isNew && (
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-cobalt)", background: "var(--kas-cobalt-soft)", padding: "1px 5px" }}>BARU</span>
                  )}
                  <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: st.bg, color: st.color, border: "1px solid var(--kas-line)" }}>
                    {st.label}
                  </span>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.2, marginTop: 6 }}>{p.name}</div>
              <div className="flex justify-between items-center mt-2.5">
                <MonoLabel size={10}>{p.client.name}</MonoLabel>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: sisa > 0 ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>
                  {sisa > 0 ? fmtIDRshort(sisa) : "Lunas"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="flex-1 relative" style={{ height: 4, background: "var(--kas-line-2)" }}>
                  <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
                </div>
                <MonoLabel size={10}>{p.progress}%</MonoLabel>
              </div>
            </button>
          );
        })}
        </div>

      {showForm && (
        <div className="fixed inset-0 z-50" style={{ background: "rgba(22,28,44,0.45)" }} onClick={() => setShowForm(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 px-5 pt-5 pb-8"
            style={{ background: "var(--kas-paper)", borderTop: "2px solid var(--kas-ink)", maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-1">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>PROYEK BARU</span>
              <button onClick={() => setShowForm(false)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 26, cursor: "pointer", lineHeight: 1, color: "var(--kas-ink-3)" }}>×</button>
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 400, margin: "4px 0 20px", letterSpacing: "-0.01em" }}>
              Tambah proyek. <em>Baru.</em>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>Nama Proyek *</div>
                <input value={form.name} onChange={field("name")} placeholder="Contoh: Atap Beton Ruko Cemara Asri" className="w-full px-3 py-3" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 16, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>Nama Klien *</div>
                <input value={form.clientName} onChange={field("clientName")} placeholder="Bpk. Wijaya / PT. Sentra Properti" className="w-full px-3 py-3" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 16, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>No. HP Klien</div>
                <input value={form.clientPhone} onChange={field("clientPhone")} type="tel" placeholder="+62 812 xxxx xxxx" className="w-full px-3 py-3" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>Lokasi / Alamat</div>
                <input value={form.address} onChange={field("address")} placeholder="Cemara Asri Blok C5, Medan" className="w-full px-3 py-3" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 16, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>Kategori *</div>
                <div className="relative">
                  <select value={form.category} onChange={field("category")} className="w-full appearance-none px-3 py-3 pr-8" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, letterSpacing: "0.08em", outline: "none", cursor: "pointer" }}>
                    <option value="">— pilih kategori —</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 pointer-events-none" style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}>▾</span>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>Status Awal</div>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                  {(Object.entries(STATUS_MAP) as [Project["status"], typeof STATUS_MAP[keyof typeof STATUS_MAP]][]).map(([k, v]) => (
                    <button key={k} type="button" onClick={() => setForm((f) => ({ ...f, status: k }))}
                      style={{ border: `1px solid ${form.status === k ? "var(--kas-ink)" : "var(--kas-line)"}`, background: form.status === k ? v.bg : "var(--kas-paper)", color: form.status === k ? v.color : "var(--kas-ink-3)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>Tgl Mulai</div>
                  <input value={form.start} onChange={field("start")} type="date" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, outline: "none" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>Est. Selesai</div>
                  <input value={form.endEst} onChange={field("endEst")} type="date" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, outline: "none" }} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 5 }}>Nilai Kontrak (Rp) *</div>
                <input value={form.contractValue || ""} onChange={field("contractValue")} type="number" min="0" placeholder="0" className="w-full px-3 py-3" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 20, outline: "none" }} />
                {form.contractValue > 0 && (
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{fmtIDRshort(form.contractValue)}</div>
                )}
              </div>
            </div>

            <div className="grid gap-2 mt-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={{ border: "1px solid var(--kas-ink)", background: "transparent", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button onClick={handleSubmit} disabled={!canSubmit} style={{ border: "none", background: canSubmit ? "var(--kas-ink)" : "var(--kas-line)", color: canSubmit ? "var(--kas-paper)" : "var(--kas-ink-3)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: canSubmit ? "pointer" : "default" }}>Buat Proyek</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
