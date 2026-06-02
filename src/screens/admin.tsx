"use client";
import { useState } from "react";
import {
  Account, PROJECTS, MATERIAL_REQUESTS, WORK_REPORTS, PENDING_REGISTRATIONS,
} from "@/lib/data";
import { Toast, MobileTopBar } from "@/components/primitives";
import AMHome from "@/components/admin/home";
import AMProjects from "@/components/admin/projects";
import AMLaporan from "@/components/admin/laporan";
import AMRequests from "@/components/admin/requests/requests";
import AMFinancial from "@/components/admin/financial/financial";
import AMMore from "@/components/admin/more/more";

type TabKey = "home" | "projects" | "requests" | "billing" | "more";

type FeedItem = { type: "hadir" | "laporan" | "material" | "daftar"; who: string; action: string; t: string; meta?: string };

const TYPE_DOT: Record<FeedItem["type"], string> = {
  hadir:    "var(--kas-cobalt)",
  laporan:  "var(--kas-ink)",
  material: "var(--kas-ochre)",
  daftar:   "var(--kas-moss)",
};
const TYPE_LABEL: Record<FeedItem["type"], string> = {
  hadir:    "Absensi",
  laporan:  "Laporan",
  material: "Material",
  daftar:   "Daftar",
};

function buildFeed(): FeedItem[] {
  return [
    ...PROJECTS.flatMap((p) =>
      p.activity.map((a) => ({ type: "hadir" as const, who: a.who, action: a.action, t: a.t, meta: p.code }))
    ),
    ...WORK_REPORTS.map((r) => ({
      type: "laporan" as const,
      who: r.workerName,
      action: `Kirim laporan${r.photos > 0 ? ` · ${r.photos} foto` : ""}`,
      t: r.date,
      meta: PROJECTS.find((p) => p.id === r.projectId)?.code,
    })),
    ...MATERIAL_REQUESTS.map((r) => ({
      type: "material" as const,
      who: r.workerName,
      action: `Minta ${r.materialName} ${r.qty} ${r.unit} · ${r.status}`,
      t: r.date,
      meta: PROJECTS.find((p) => p.id === r.projectId)?.code,
    })),
    ...PENDING_REGISTRATIONS.map((r) => ({
      type: "daftar" as const,
      who: r.name,
      action: `Mendaftar sebagai ${r.jabatan}`,
      t: r.submittedAt,
    })),
  ];
}

const FEED = buildFeed();

function NotificationPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ background: "rgba(22,28,44,0.45)" }} onClick={onClose}>
      <div
        className="absolute top-0 left-0 right-0 flex flex-col"
        style={{ maxHeight: "72vh", background: "var(--kas-paper)", borderBottom: "2px solid var(--kas-ink)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
            Aktivitas · {FEED.length} item
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 22, lineHeight: 1, color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-4">
          {FEED.map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
              <div className="pt-1.5 flex-shrink-0">
                <span style={{ display: "inline-block", width: 7, height: 7, background: TYPE_DOT[item.type] }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{item.who}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", letterSpacing: "0.1em", flexShrink: 0 }}>{item.t}</span>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.06em" }}>{item.action}</div>
                {item.meta && (
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", marginTop: 2, letterSpacing: "0.1em" }}>
                    {TYPE_LABEL[item.type]} · {item.meta}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminMobile({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const [tab, setTab]         = useState<TabKey>("home");
  const [projSub, setProjSub] = useState<"status" | "laporan">("status");
  const [snack, setSnack]     = useState<string | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const toast = (m: string) => { setSnack(m); setTimeout(() => setSnack(null), 2400); };

  const sess = session || { name: "Bu Sari", short: "SR" };

  const TABS = [
    { k: "home",     l: "Beranda",    icon: "⌂" },
    { k: "projects", l: "Proyek",     icon: "▦" },
    { k: "requests", l: "Permintaan", icon: "✦" },
    { k: "billing",  l: "Tagihan",    icon: "$" },
    { k: "more",     l: "Lainnya",    icon: "≡" },
  ] as const;

  const tabLabels: Record<TabKey, string> = {
    home:     "01 · BERANDA",
    projects: "02 · PROYEK",
    requests: "03 · PERMINTAAN",
    billing:  "04 · TAGIHAN",
    more:     "05 · LAINNYA",
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif" }}>
      <MobileTopBar tabLabel={tabLabels[tab]}>
        <button
          onClick={() => setShowNotif((v) => !v)}
          className="relative grid place-items-center"
          style={{ border: "1px solid var(--kas-line)", background: showNotif ? "var(--kas-ink)" : "transparent", color: showNotif ? "var(--kas-paper)" : "var(--kas-ink-2)", width: 32, height: 32, cursor: "pointer", flexShrink: 0 }}
          aria-label="Aktivitas hari ini"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {FEED.length > 0 && (
            <span
              className="absolute"
              style={{ top: -5, right: -5, minWidth: 16, height: 16, background: "var(--kas-rust)", color: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, fontWeight: 700, letterSpacing: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}
            >
              {FEED.length}
            </span>
          )}
        </button>
      </MobileTopBar>

      {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}

      <div className="flex-1 overflow-y-auto">
        {tab === "home"     && <AMHome />}
        {tab === "projects" && projSub === "status"  && <AMProjects toast={toast} />}
        {tab === "projects" && projSub === "laporan" && <AMLaporan />}
        {tab === "requests" && <AMRequests toast={toast} />}
        {tab === "billing"  && <AMFinancial toast={toast} />}
        {tab === "more"     && <AMMore session={sess} toast={toast} onLogout={onLogout} />}
      </div>

      {/* Sub-tab bars */}
      {tab === "projects" && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
          {(["status", "laporan"] as const).map((k, i) => (
            <button
              key={k}
              onClick={() => setProjSub(k)}
              style={{
                border: "none",
                borderRight: i === 0 ? "1px solid var(--kas-line)" : "none",
                borderTop: projSub === k ? "2px solid var(--kas-ink)" : "2px solid transparent",
                background: projSub === k ? "var(--kas-ink)" : "transparent",
                color: projSub === k ? "var(--kas-paper)" : "var(--kas-ink-3)",
                padding: "10px 0",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {k === "status" ? "Status Proyek" : "Laporan Harian"}
            </button>
          ))}
        </div>
      )}

      <nav className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", borderTop: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
        {TABS.map((t, i) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as TabKey)}
            className="flex flex-col items-center gap-0.5 py-2.5 pb-3 cursor-pointer"
            style={{
              border: "none",
              borderRight: i < 4 ? "1px solid var(--kas-line)" : "none",
              background: tab === t.k ? "var(--kas-ink)" : "transparent",
              color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)",
            }}
          >
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase" }}>{t.l}</span>
          </button>
        ))}
      </nav>

      {snack && <Toast message={snack} />}
    </div>
  );
}
