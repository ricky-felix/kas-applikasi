"use client";
import { useState } from "react";
import { Account } from "@/lib/data";
import { Toast, MobileTopBar } from "@/components/primitives";
import AMHome from "@/components/admin/home";
import AMProjects from "@/components/admin/projects";
import AMLaporan from "@/components/admin/laporan";
import AMRequests, { RequestsSubTabs, ReqSubTab } from "@/components/admin/requests/requests";
import AMFinancial, { FinancialSubTabs, SubTab as FinSubTab } from "@/components/admin/financial/financial";
import AMMore from "@/components/admin/more/more";

type TabKey = "home" | "projects" | "requests" | "billing" | "more";

export default function AdminMobile({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const [tab, setTab]           = useState<TabKey>("home");
  const [finSub, setFinSub]     = useState<FinSubTab>("tagihan");
  const [reqSub, setReqSub]     = useState<ReqSubTab>("material");
  const [projSub, setProjSub]   = useState<"status" | "laporan">("status");
  const [snack, setSnack]   = useState<string | null>(null);
  const toast = (m: string) => { setSnack(m); setTimeout(() => setSnack(null), 2400); };

  const sess = session || { name: "Bu Sari", short: "SR" };

  const TABS = [
    { k: "home",     n: "01", l: "Beranda",  icon: "⌂" },
    { k: "projects", n: "02", l: "Proyek",   icon: "▦" },
    { k: "requests", n: "03", l: "Permintaan", icon: "✦" },
    { k: "billing",  n: "04", l: "Financial",  icon: "$" },
    { k: "more",     n: "05", l: "Lainnya",    icon: "≡" },
  ] as const;

  const tabLabels: Record<TabKey, string> = {
    home:     "01 · BERANDA",
    projects: "02 · PROYEK",
    requests: "03 · PERMINTAAN",
    billing:  "04 · FINANCIAL",
    more:     "05 · LAINNYA",
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif" }}>
      <MobileTopBar tabLabel={tabLabels[tab]} />

      <div className="flex-1 overflow-y-auto">
        {tab === "home"     && <AMHome />}
        {tab === "projects" && projSub === "status"  && <AMProjects toast={toast} />}
        {tab === "projects" && projSub === "laporan" && <AMLaporan />}
        {tab === "requests" && <AMRequests sub={reqSub} toast={toast} />}
        {tab === "billing"  && <AMFinancial sub={finSub} toast={toast} />}
        {tab === "more"     && <AMMore session={sess} toast={toast} onLogout={onLogout} />}
      </div>

      {/* Sub-tab bars — sit directly above the main nav */}
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
      {tab === "requests" && <RequestsSubTabs active={reqSub} setActive={setReqSub} />}
      {tab === "billing"  && <FinancialSubTabs active={finSub} setActive={setFinSub} />}

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
