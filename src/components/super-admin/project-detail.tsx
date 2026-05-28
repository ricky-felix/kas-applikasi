"use client";
import { useState } from "react";
import { PROJECTS, fmtIDRshort } from "@/lib/data";
import { MonoLabel, StatusPill, ProgressBar } from "@/components/primitives";
import { TopBar, Footer } from "./shared";
import { OverviewTab }      from "./project-detail/overview-tab";
import { TeamTab }          from "./project-detail/team-tab";
import { MaterialTab }      from "./project-detail/material-tab";
import { BillingTab }       from "./project-detail/billing-tab";
import { PhotosTab }        from "./project-detail/photos-tab";
import { WorkReportsTab }   from "./project-detail/work-reports-tab";
import { ChangeOrdersTab }  from "./project-detail/change-orders-tab";

const TABS = [
  { k: "overview", n: "I",   label: "Ringkasan" },
  { k: "team",     n: "II",  label: "Tim & Absensi" },
  { k: "material", n: "III", label: "Material" },
  { k: "billing",  n: "IV",  label: "Tagihan" },
  { k: "photos",   n: "V",   label: "Foto" },
  { k: "reports",  n: "VI",  label: "Laporan Harian" },
  { k: "changes",  n: "VII", label: "Change Order" },
];

export default function ProjectDetail({ id, back }: { id: string; back: () => void }) {
  const p    = PROJECTS.find((x) => x.id === id) || PROJECTS[0];
  const [tab, setTab] = useState("overview");
  const sisa = p.contractValue - p.paid;

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar crumb={
        <>
          <button type="button" onClick={back} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>← Proyek</button>
          <span style={{ color: "var(--kas-ink-3)", margin: "0 8px" }}>/</span>
          <MonoLabel size={10}>{p.code}</MonoLabel>
        </>
      } />

      {/* Hero */}
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
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 24, marginTop: 6, color: s.accent ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex mt-6" style={{ borderBottom: "1px solid var(--kas-ink)" }}>
        {TABS.map((t, i) => (
          <button key={t.k} type="button" onClick={() => setTab(t.k)} className="flex items-center gap-2.5 cursor-pointer" style={{ border: "none", borderRight: i < TABS.length - 1 ? "1px solid var(--kas-line)" : "none", background: tab === t.k ? "var(--kas-ink)" : "transparent", color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)", padding: "12px 18px" }}>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 12, fontStyle: "italic", opacity: 0.6 }}>{t.n}</span>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-7">
        {tab === "overview" && <OverviewTab p={p} />}
        {tab === "team"     && <TeamTab p={p} />}
        {tab === "material" && <MaterialTab />}
        {tab === "billing"  && <BillingTab p={p} />}
        {tab === "photos"   && <PhotosTab />}
        {tab === "reports"  && <WorkReportsTab projectId={p.id} />}
        {tab === "changes"  && <ChangeOrdersTab projectId={p.id} />}
      </div>
      <Footer />
    </div>
  );
}
