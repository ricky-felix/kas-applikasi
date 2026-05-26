"use client";
import { useState } from "react";
import { Account } from "@/lib/data";
import { Toast, MobileTopBar } from "../ui";
import AMHome from "./home";
import AMProjects from "./projects";
import AMAttend from "./attend";
import AMBilling from "./billing";
import AMMore from "./more/index";

type TabKey = "home" | "projects" | "attend" | "billing" | "more";

export default function AdminMobile({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const [tab, setTab] = useState<TabKey>("home");
  const [snack, setSnack] = useState<string | null>(null);
  const toast = (m: string) => { setSnack(m); setTimeout(() => setSnack(null), 2400); };

  const sess = session || { name: "Bu Sari", short: "SR" };

  const TABS = [
    { k: "home",     n: "01", l: "Beranda", icon: "⌂" },
    { k: "projects", n: "02", l: "Proyek",  icon: "▭" },
    { k: "attend",   n: "03", l: "Absensi", icon: "✓" },
    { k: "billing",  n: "04", l: "Tagihan", icon: "$" },
    { k: "more",     n: "05", l: "Lainnya", icon: "≡" },
  ] as const;

  const tabLabels: Record<TabKey, string> = { home: "01 · BERANDA", projects: "02 · PROYEK", attend: "03 · ABSENSI", billing: "04 · TAGIHAN", more: "05 · LAINNYA" };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif" }}>
      <MobileTopBar tabLabel={tabLabels[tab]} />

      <div className="flex-1 overflow-y-auto">
        {tab === "home"     && <AMHome />}
        {tab === "projects" && <AMProjects toast={toast} />}
        {tab === "attend"   && <AMAttend toast={toast} />}
        {tab === "billing"  && <AMBilling toast={toast} />}
        {tab === "more"     && <AMMore session={sess} toast={toast} onLogout={onLogout} />}
      </div>

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
