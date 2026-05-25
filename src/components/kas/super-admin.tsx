"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, BILLING, MATERIALS, TODAY, TODAY_SHORT, fmtIDR, fmtIDRshort } from "@/lib/data";
import { Account } from "@/lib/data";
import { KasBrandMark, MonoLabel, StatusPill, ProgressBar } from "./ui";

type Page = "dashboard" | "projects" | "project" | "team" | "billing" | "users";

export default function SuperAdmin({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const [view, setView] = useState<{ page: Page; projectId?: string }>({ page: "dashboard" });
  const sess = session || { name: "Ricky", short: "RC" };

  return (
    <div className="h-full grid overflow-hidden" style={{ gridTemplateColumns: "220px 1fr", background: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}>
      <Sidebar view={view} setView={setView} session={sess} onLogout={onLogout} />
      <main className="overflow-y-auto no-scrollbar">
        {view.page === "dashboard" && <Dashboard goProject={(id) => setView({ page: "project", projectId: id })} goProjects={() => setView({ page: "projects" })} />}
        {view.page === "projects" && <ProjectsList goProject={(id) => setView({ page: "project", projectId: id })} />}
        {view.page === "project" && <ProjectDetail id={view.projectId!} back={() => setView({ page: "projects" })} />}
        {view.page === "team" && <TeamPage />}
        {view.page === "billing" && <BillingPage />}
        {view.page === "users" && <UsersPage />}
      </main>
    </div>
  );
}

function Sidebar({ view, setView, session, onLogout }: { view: { page: Page }; setView: (v: { page: Page }) => void; session: { name: string; short: string }; onLogout: () => void }) {
  const items = [
    { k: "dashboard", n: "01", label: "Dashboard" },
    { k: "projects",  n: "02", label: "Proyek" },
    { k: "team",      n: "03", label: "Tim & Absensi" },
    { k: "billing",   n: "04", label: "Tagihan" },
    { k: "users",     n: "05", label: "Pengguna" },
  ] as const;

  return (
    <aside className="flex flex-col px-4 py-5" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", borderRight: "1px solid var(--kas-ink)" }}>
      <div className="flex items-center gap-2.5 mb-7">
        <div className="relative grid place-items-center" style={{ width: 28, height: 28, background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-newsreader), serif", fontWeight: 600, fontSize: 14 }}>
          K<span className="absolute" style={{ right: -2, bottom: -2, width: 5, height: 5, background: "var(--kas-orange)" }} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1, fontWeight: 500 }}>Tauke</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.22em", color: "rgba(251,248,241,0.5)", marginTop: 3, textTransform: "uppercase" }}>Super Admin</div>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(251,248,241,0.4)", textTransform: "uppercase", marginBottom: 10 }}>Menu</div>
      <nav className="flex flex-col">
        {items.map((it, i) => {
          const active = view.page === it.k || (it.k === "projects" && view.page === "project");
          return (
            <button
              key={it.k}
              onClick={() => setView({ page: it.k })}
              className="grid items-center gap-2.5 py-3 text-left cursor-pointer"
              style={{
                gridTemplateColumns: "auto 1fr auto",
                border: "none",
                background: "transparent",
                borderTop: i === 0 ? "1px solid rgba(251,248,241,0.15)" : "none",
                borderBottom: "1px solid rgba(251,248,241,0.15)",
                color: active ? "var(--kas-paper)" : "rgba(251,248,241,0.6)",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "rgba(251,248,241,0.4)" }}>{it.n}</span>
              <span>{it.label}</span>
              {active && <span className="inline-block" style={{ width: 6, height: 6, background: "var(--kas-orange)" }} />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(251,248,241,0.4)", textTransform: "uppercase", marginBottom: 10 }}>Sesi</div>
        <div className="flex items-center gap-2.5 py-2.5" style={{ borderTop: "1px solid rgba(251,248,241,0.15)" }}>
          <div className="grid place-items-center" style={{ width: 28, height: 28, background: "var(--kas-orange)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 12, fontWeight: 600 }}>{session.short[0]}</div>
          <div className="flex-1">
            <div style={{ fontSize: 13, fontWeight: 600 }}>{session.name}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "rgba(251,248,241,0.5)", textTransform: "uppercase" }}>Super Admin</div>
          </div>
          <button onClick={onLogout} style={{ border: "1px solid rgba(251,248,241,0.3)", background: "transparent", color: "rgba(251,248,241,0.7)", padding: "4px 8px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" }}>Out</button>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, crumb }: { title?: string; crumb?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-5">
      <div className="flex items-center gap-3.5">
        {crumb || <MonoLabel size={10}>{title}</MonoLabel>}
      </div>
      <div className="flex items-center gap-3.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
        <span>{TODAY}</span>
        <span className="inline-block" style={{ width: 6, height: 6, background: "var(--kas-orange)" }} />
        <span>Live</span>
      </div>
    </div>
  );
}

function SectionHead({ no, kicker, children }: { no: string; kicker: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5 mb-3">
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", letterSpacing: "0.14em" }}>{no}</span>
        <span className="flex-1" style={{ height: 1, background: "var(--kas-line)" }} />
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.2em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{kicker}</span>
      </div>
      <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.01em", margin: 0 }}>{children}</h2>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-14 pt-5 flex justify-between" style={{ borderTop: "1px solid var(--kas-ink)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
      <span>Tauke © 2026 · CV Karya Agung Sejati</span>
      <span>Medan, Sumatera Utara</span>
    </div>
  );
}

function Dashboard({ goProject, goProjects }: { goProject: (id: string) => void; goProjects: () => void }) {
  const active = PROJECTS.filter((p) => p.status === "Active");
  const outstanding = PROJECTS.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const workersOnSite = WORKERS.filter((w) => active.some((p) => p.assigned.includes(w.id))).length;

  const stats = [
    { n: "01", label: "Proyek aktif",       value: String(active.length).padStart(2, "0"), sub: `${PROJECTS.length} total`, accent: false },
    { n: "02", label: "Pendapatan bulan ini", value: fmtIDRshort(24850000), sub: "+12% vs Apr",           accent: false },
    { n: "03", label: "Belum dibayar",       value: fmtIDRshort(outstanding), sub: "2 termin pending",   accent: true },
    { n: "04", label: "Pekerja di lapangan", value: String(workersOnSite).padStart(2, "0"), sub: `${WORKERS.length} pekerja total`, accent: false },
  ];

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Dashboard" />
      <SectionHead no="01" kicker={`${TODAY_SHORT} · LIVE`}>
        Empat angka, <em>satu pagi.</em>
      </SectionHead>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {stats.map((s, i) => (
          <div key={i} className="p-5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none" }}>
            <div className="flex items-center gap-2">
              <MonoLabel size={10}>{s.n}</MonoLabel>
              <span className="flex-1" style={{ height: 1, background: "var(--kas-line-2)" }} />
            </div>
            <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, marginTop: 12, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 44, lineHeight: 1.0, letterSpacing: "-0.02em", marginTop: 8, color: s.accent ? "var(--kas-orange)" : "var(--kas-ink)" }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 8, letterSpacing: "0.08em" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-9 mt-11" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <section>
          <SectionHead no="02" kicker="DALAM PENGERJAAN">Proyek aktif, <em>sedang berjalan.</em></SectionHead>
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {active.map((p, i) => (
              <button
                key={p.id}
                onClick={() => goProject(p.id)}
                className="w-full grid gap-4 items-center py-4 text-left cursor-pointer"
                style={{ gridTemplateColumns: "28px 1fr 1fr auto", border: "none", background: "transparent", borderBottom: "1px solid var(--kas-line)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--kas-paper-2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.client.name}</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-1" style={{ height: 4, background: "var(--kas-line-2)", maxWidth: 140 }}>
                    <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
                  </div>
                  <MonoLabel size={11}>{p.progress}%</MonoLabel>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={p.status} />
                  <span style={{ color: "var(--kas-ink-3)", fontSize: 18 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionHead no="03" kicker="HARI INI">Aktivitas <em>lapangan.</em></SectionHead>
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {[...PROJECTS[0].activity, ...PROJECTS[1].activity].slice(0, 6).map((a, i) => (
              <div key={i} className="grid gap-3.5 items-baseline py-3.5" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line)" }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", minWidth: 56 }}>{a.t}</span>
                <div style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{a.who}</span>
                  <span style={{ color: "var(--kas-ink-3)" }}> — {a.action}</span>
                </div>
                {a.action.includes("Hadir") && <span className="inline-block" style={{ width: 6, height: 6, background: "var(--kas-orange)" }} />}
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

function ProjectsList({ goProject }: { goProject: (id: string) => void }) {
  const [filter, setFilter] = useState("All");
  const filtered = PROJECTS.filter((p) => filter === "All" || p.status === filter);

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Proyek" />
      <div className="flex justify-between items-end mb-5">
        <SectionHead no="—" kicker={`${PROJECTS.length} TOTAL`}>Semua proyek, <em>satu daftar.</em></SectionHead>
        <button className="flex items-center gap-2 px-5 py-3" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
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
              <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", color: p.contractValue - p.paid > 0 ? "var(--kas-orange)" : "var(--kas-ink-3)" }}>
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
    </div>
  );
}

function ProjectDetail({ id, back }: { id: string; back: () => void }) {
  const p = PROJECTS.find((x) => x.id === id) || PROJECTS[0];
  const [tab, setTab] = useState("overview");
  const sisa = p.contractValue - p.paid;

  const tabs = [
    { k: "overview", n: "I",   label: "Ringkasan" },
    { k: "team",     n: "II",  label: "Tim & Absensi" },
    { k: "material", n: "III", label: "Material" },
    { k: "billing",  n: "IV",  label: "Tagihan" },
    { k: "photos",   n: "V",   label: "Foto" },
  ];

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar crumb={
        <>
          <button onClick={back} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>← Proyek</button>
          <span style={{ color: "var(--kas-ink-3)", margin: "0 8px" }}>/</span>
          <MonoLabel size={10}>{p.code}</MonoLabel>
        </>
      } />

      <div className="grid gap-9 py-6" style={{ gridTemplateColumns: "1.6fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        <div>
          <div className="flex items-center gap-2.5 mb-2.5"><StatusPill status={p.status} /><MonoLabel size={10}>{p.category.toUpperCase()}</MonoLabel></div>
          <h1 style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 48, lineHeight: 1.0, letterSpacing: "-0.02em", margin: "8px 0 0" }}>
            {p.name.split(" ").slice(0, -1).join(" ")} <em>{p.name.split(" ").slice(-1)[0]}.</em>
          </h1>
          <div className="flex gap-7 mt-5" style={{ color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, letterSpacing: "0.1em" }}>
            {[{ l: "Klien", v: p.client.name }, { l: "Mulai", v: p.start }, { l: "Est. Selesai", v: p.endEst }, { l: "Lokasi", v: p.address }].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" }}>{f.l}</div>
                <div style={{ color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, marginTop: 4 }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid" style={{ gridTemplateRows: "1fr 1fr" }}>
          <div className="pb-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <MonoLabel size={10}>Progres</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 40, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em" }}>{p.progress}%</div>
            <ProgressBar pct={p.progress} height={6} />
          </div>
          <div className="pt-4 grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[{ l: "Nilai Kontrak", v: fmtIDRshort(p.contractValue), accent: false }, { l: "Sisa Tagihan", v: sisa > 0 ? fmtIDRshort(sisa) : "Lunas", accent: sisa > 0 }].map((s, i) => (
              <div key={i}>
                <MonoLabel size={10}>{s.l}</MonoLabel>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 24, marginTop: 6, color: s.accent ? "var(--kas-orange)" : "var(--kas-ink)" }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex mt-6" style={{ borderBottom: "1px solid var(--kas-ink)" }}>
        {tabs.map((t, i) => (
          <button key={t.k} onClick={() => setTab(t.k)} className="flex items-center gap-2.5 cursor-pointer" style={{ border: "none", borderRight: i < 4 ? "1px solid var(--kas-line)" : "none", background: tab === t.k ? "var(--kas-ink)" : "transparent", color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)", padding: "14px 22px" }}>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 12, fontStyle: "italic", opacity: 0.6 }}>{t.n}</span>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="py-7">
        {tab === "overview" && <OverviewTab p={p} />}
        {tab === "team" && <TeamTab p={p} />}
        {tab === "material" && <MaterialTab />}
        {tab === "billing" && <BillingTabComp p={p} />}
        {tab === "photos" && <PhotosTab />}
      </div>
      <Footer />
    </div>
  );
}

function OverviewTab({ p }: { p: typeof PROJECTS[0] }) {
  return (
    <div className="grid gap-9" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
      <div>
        <SectionHead no="01" kicker="CATATAN INTERNAL">Ringkasan, <em>secukupnya.</em></SectionHead>
        <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 19, lineHeight: 1.5, margin: 0, color: "var(--kas-ink-2)" }}>
          Lapisan utama sudah diaplikasikan, sedang menunggu cure 24 jam sebelum primer ke-dua. Akses ke lantai 3 disepakati lewat tangga belakang. Klien minta progres foto tiap Jumat sore.
        </p>
        <div className="grid mt-6" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)" }}>
          {[{ l: "Pekerja Aktif", v: String(p.assigned.length).padStart(2, "0") }, { l: "Hari Berjalan", v: "12" }, { l: "Foto Progres", v: "47" }].map((s, i) => (
            <div key={i} className="py-4 pr-4" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
              <MonoLabel size={10}>{s.l}</MonoLabel>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 4 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionHead no="02" kicker="KONTAK">Klien.</SectionHead>
        <div style={{ borderTop: "1px solid var(--kas-line)" }}>
          {[{ l: "Nama", v: p.client.name }, { l: "Telepon", v: p.client.phone }, { l: "Alamat", v: p.client.address }].map((r, i) => (
            <div key={i} className="grid gap-3.5 py-3.5" style={{ gridTemplateColumns: "120px 1fr", borderBottom: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{r.l}</MonoLabel>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14 }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamTab({ p }: { p: typeof PROJECTS[0] }) {
  const assigned = WORKERS.filter((w) => p.assigned.includes(w.id));
  const statuses = ["Hadir","Hadir","Setengah Hari","Tidak Hadir","Hadir","Hadir"];
  return (
    <div>
      <SectionHead no="01" kicker={`${assigned.length} ORANG DITUGASKAN`}>Tim, <em>hari ini.</em></SectionHead>
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0" }}>Pekerja</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Peran</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Status</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Tarif/Hari</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Hadir</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Upah Tersisa</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {assigned.map((w, i) => {
            const days = [10, 12, 8][i] || 9;
            const owed = days * w.rate;
            const status = statuses[i] || "Hadir";
            return (
              <tr key={w.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "16px 14px 16px 0" }}>
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500 }}>{w.short}</div>
                    <div>
                      <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 2 }}>{w.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 14px", color: "var(--kas-ink-2)" }}>{w.role}</td>
                <td style={{ padding: "16px 14px" }}>
                  <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: status === "Hadir" ? "var(--kas-orange-soft)" : status === "Setengah Hari" ? "var(--kas-amber-soft)" : "var(--kas-paper-2)", color: status === "Tidak Hadir" ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>{status}</span>
                </td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{fmtIDR(w.rate)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{days}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-orange)" }}>{fmtIDR(owed)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right" }}>
                  <button style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Bayar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MaterialTab() {
  return (
    <div>
      <SectionHead no="01" kicker="DIPAKAI VS DIANGGARKAN">Material, <em>terpakai.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {MATERIALS.map((m, i) => {
          const pct = Math.round((m.used / m.budget) * 100);
          const low = pct >= 90;
          return (
            <div key={i} className="grid gap-5 items-center py-4" style={{ gridTemplateColumns: "auto 1fr 1.4fr auto auto", borderBottom: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{m.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{m.supplier}</div>
              </div>
              <div>
                <div className="flex justify-between mb-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                  <span>{m.used} / {m.budget} {m.unit}</span>
                  <span style={{ color: low ? "var(--kas-orange)" : "var(--kas-ink-3)" }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} />
              </div>
              <span className="px-2 py-1 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: low ? "var(--kas-orange-soft)" : "var(--kas-paper-2)", border: "1px solid var(--kas-line)", minWidth: 90 }}>{low ? "Stok Tipis" : "Aman"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BillingTabComp({ p }: { p: typeof PROJECTS[0] }) {
  const paid = BILLING.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const pending = BILLING.filter((b) => b.status !== "Paid").reduce((s, b) => s + b.amount, 0);
  return (
    <div>
      <div className="grid mb-7" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[{ l: "Total Kontrak", v: fmtIDR(p.contractValue), accent: false }, { l: "Sudah Dibayar", v: fmtIDR(paid), accent: false }, { l: "Sisa Tagihan", v: fmtIDR(pending), accent: true }].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 8, color: s.accent ? "var(--kas-orange)" : "var(--kas-ink)" }}>{s.v}</div>
          </div>
        ))}
      </div>
      <SectionHead no="01" kicker="EMPAT TAHAP">Pembayaran, <em>berkelanjutan.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {BILLING.map((b, i) => (
          <div key={i} className="grid gap-6 items-center py-5" style={{ gridTemplateColumns: "48px 1fr auto auto auto", borderBottom: "1px solid var(--kas-line)" }}>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontStyle: "italic", color: b.status === "Paid" ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>{["I","II","III","IV"][i]}</span>
            <div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20 }}>{b.stage}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{b.date ? `Dibayar ${b.date}` : "Belum dibayar"}</div>
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 16, color: b.status === "Paid" ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>{fmtIDR(b.amount)}</div>
            <span className="px-2.5 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: b.status === "Paid" ? "var(--kas-green-soft)" : "var(--kas-orange-soft)", color: b.status === "Paid" ? "var(--kas-green)" : "var(--kas-orange-ink)" }}>{b.status === "Paid" ? "Lunas" : "Pending"}</span>
            <div className="flex gap-2">
              {b.status !== "Paid" && (
                <>
                  <button style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tandai Lunas</button>
                  <button className="flex items-center gap-1.5" style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                    <WAIcon />Tagih
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotosTab() {
  const photos = [{ phase: "Sebelum", n: 12 }, { phase: "Pengerjaan", n: 28 }, { phase: "Sesudah", n: 7 }];
  return (
    <div>
      <SectionHead no="01" kicker="LOG VISUAL">Foto, <em>tiga fase.</em></SectionHead>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {photos.map((g, i) => (
          <div key={i}>
            <div className="relative grid place-items-center" style={{ aspectRatio: "4/3", background: "repeating-linear-gradient(45deg, var(--kas-paper-2) 0 12px, var(--kas-line-2) 12px 13px)", border: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{g.n} foto</MonoLabel>
              <div className="absolute top-2 left-2" style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontStyle: "italic", background: "var(--kas-paper)", padding: "2px 8px" }}>{["I","II","III"][i]}</div>
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, marginTop: 10 }}>{g.phase}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamPage() {
  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Tim & Absensi" />
      <SectionHead no="—" kicker={`${WORKERS.length} PEKERJA`}>Tim, <em>lengkap.</em></SectionHead>
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0" }}>Pekerja</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Peran</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Tarif/Hari</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Hari Hadir (30 hari)</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Belum Dibayar</th>
          </tr>
        </thead>
        <tbody>
          {WORKERS.map((w, i) => {
            const days = [22,18,20,24,19,15][i] || 18;
            const owed = (days % 5) * w.rate;
            return (
              <tr key={w.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "16px 14px 16px 0" }}>
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500 }}>{w.short}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{w.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 14px", color: "var(--kas-ink-2)" }}>{w.role}</td>
                <td style={{ padding: "16px 14px", fontFamily: "var(--font-jetbrains), monospace" }}>{fmtIDR(w.rate)}</td>
                <td style={{ padding: "16px 14px" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="relative" style={{ width: 120, height: 4, background: "var(--kas-line-2)" }}>
                      <div className="absolute inset-y-0 left-0" style={{ width: `${(days / 30) * 100}%`, background: "var(--kas-ink)" }} />
                    </div>
                    <MonoLabel size={11}>{days}/30</MonoLabel>
                  </div>
                </td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", color: owed > 0 ? "var(--kas-orange)" : "var(--kas-ink-3)" }}>{owed > 0 ? fmtIDR(owed) : "Lunas"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer />
    </div>
  );
}

function BillingPage() {
  const total = PROJECTS.reduce((s, p) => s + p.contractValue, 0);
  const paid = PROJECTS.reduce((s, p) => s + p.paid, 0);
  const outstanding = total - paid;
  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Tagihan" />
      <SectionHead no="—" kicker="SEMUA PROYEK">Tagihan, <em>satu papan.</em></SectionHead>
      <div className="grid mb-7" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[{ l: "Total Kontrak", v: fmtIDR(total), accent: false }, { l: "Sudah Dibayar", v: fmtIDR(paid), accent: false }, { l: "Sisa Outstanding", v: fmtIDR(outstanding), accent: true }].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 8, color: s.accent ? "var(--kas-orange)" : "var(--kas-ink)" }}>{s.v}</div>
          </div>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0" }}>Proyek</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Klien</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Nilai</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Dibayar</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Sisa</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {PROJECTS.map((p) => {
            const sisa = p.contractValue - p.paid;
            return (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "16px 14px 16px 0" }}>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{p.code}</div>
                </td>
                <td style={{ padding: "16px 14px" }}>{p.client.name}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace" }}>{fmtIDR(p.contractValue)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", color: "var(--kas-ink-3)" }}>{fmtIDR(p.paid)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", color: sisa > 0 ? "var(--kas-orange)" : "var(--kas-ink-3)" }}>{sisa > 0 ? fmtIDR(sisa) : "—"}</td>
                <td style={{ padding: "16px 14px", textAlign: "right" }}>
                  {sisa > 0 ? <button style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tagih</button>
                  : <span style={{ color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em" }}>LUNAS</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer />
    </div>
  );
}

function UsersPage() {
  const [createRole, setCreateRole] = useState<string | null>(null);
  const users = [
    { name: "Ricky", phone: "0811 6000 0001", role: "super_admin", short: "RC", since: "Jan 2024" },
    { name: "Pak Hartono", phone: "0812 6011 8821", role: "owner", short: "PH", since: "Jan 2024" },
    { name: "Bu Sari", phone: "0813 6001 0055", role: "admin", short: "SR", since: "Feb 2024" },
    ...WORKERS.map((w) => ({ name: w.name, phone: w.phone.replace("+62 ", "0"), role: "worker", short: w.short, since: "Mar 2024" })),
  ];
  const counts = { super_admin: 1, owner: 1, admin: 1, worker: WORKERS.length };

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Pengguna" />
      <div className="flex justify-between items-end mb-4">
        <SectionHead no="—" kicker={`${users.length} AKUN AKTIF`}>Pengguna, <em>semua peran.</em></SectionHead>
        <div className="flex gap-1.5">
          {["owner","admin","worker"].map((r) => (
            <button key={r} onClick={() => setCreateRole(r)} className="flex items-center gap-2 px-4 py-3" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 0.5 }}>+</span>
              {r === "owner" ? "Owner" : r === "admin" ? "Administrasi" : "Pekerja"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid mb-7" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[
          { r: "super_admin", l: "Super Admin", c: counts.super_admin, canBy: "—" },
          { r: "owner", l: "Owner", c: counts.owner, canBy: "Super Admin" },
          { r: "admin", l: "Administrasi", c: counts.admin, canBy: "Super Admin, Owner" },
          { r: "worker", l: "Pekerja", c: counts.worker, canBy: "Super, Owner, Administrasi" },
        ].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em" }}>{String(s.c).padStart(2, "0")}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Dibuat oleh: {s.canBy}</div>
          </div>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0", width: 40 }}>#</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Nama</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Nomor HP</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Peran</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Sejak</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <td style={{ padding: "16px 14px 16px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{String(i + 1).padStart(2, "0")}</td>
              <td style={{ padding: "16px 14px" }}>
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center" style={{ width: 30, height: 30, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 12, fontWeight: 500 }}>{u.short}</div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                </div>
              </td>
              <td style={{ padding: "16px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{u.phone}</td>
              <td style={{ padding: "16px 14px" }}>
                <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: u.role === "super_admin" ? "var(--kas-ink)" : u.role === "owner" ? "var(--kas-orange-soft)" : u.role === "admin" ? "var(--kas-amber-soft)" : "var(--kas-paper-2)", color: u.role === "super_admin" ? "var(--kas-paper)" : "var(--kas-ink)", border: u.role === "super_admin" ? "none" : "1px solid var(--kas-line)" }}>
                  {u.role === "super_admin" ? "Super" : u.role === "owner" ? "Owner" : u.role === "admin" ? "Administrasi" : "Pekerja"}
                </span>
              </td>
              <td style={{ padding: "16px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink-3)" }}>{u.since}</td>
              <td style={{ padding: "16px 14px", textAlign: "right" }}>
                <button style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "5px 10px", marginRight: 6, fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Reset Kode</button>
                <button style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {createRole && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(14,12,9,0.5)", zIndex: 50 }} onClick={() => setCreateRole(null)}>
          <div onClick={(e) => e.stopPropagation()} className="p-7" style={{ width: 520, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)" }}>
            <div className="flex justify-between items-center mb-3.5">
              <MonoLabel size={10}>BUAT AKUN BARU</MonoLabel>
              <button onClick={() => setCreateRole(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 38, fontWeight: 400, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
              <span style={{ fontStyle: "italic", color: "var(--kas-ink-3)", marginRight: 14 }}>{createRole === "owner" ? "I" : createRole === "admin" ? "II" : "III"}</span>
              Akun <em>{createRole === "owner" ? "Owner" : createRole === "admin" ? "Administrasi" : "Pekerja"}.</em>
            </h2>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { l: "Nama lengkap", ph: "Contoh: Budi Hartono", span: 2 },
                { l: "Nomor HP", ph: "0812 6011 0000", span: 1 },
                { l: "Kode akses (6)", ph: "ABC123", span: 1 },
                ...(createRole === "worker" ? [{ l: "Tarif harian (Rp)", ph: "200.000", span: 2 }] : []),
              ].map((f, i) => (
                <div key={i} style={{ gridColumn: `span ${f.span}` }}>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>{f.l}</div>
                  <input placeholder={f.ph} className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2.5 justify-end mt-5">
              <button onClick={() => setCreateRole(null)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "12px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button onClick={() => setCreateRole(null)} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "12px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Buat</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

function WAIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4z" /></svg>;
}
