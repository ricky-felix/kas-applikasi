"use client";
import { useState } from "react";
import { Account } from "@/lib/data";
import { KasBrandMark } from "../ui";
import Dashboard from "./dashboard";
import ProjectsList from "./projects-list";
import ProjectDetail from "./project-detail";
import TeamPage from "./team-page";
import BillingPage from "./billing-page";
import MaterialPage from "./material-page";
import FinancePage from "./finance-page";
import TimelinePage from "./timeline-page";
import UsersPage from "./users-page";

type Page = "dashboard" | "projects" | "project" | "team" | "billing" | "users" | "material" | "finance" | "timeline";

function Sidebar({ view, setView, session, onLogout }: { view: { page: Page }; setView: (v: { page: Page }) => void; session: { name: string; short: string }; onLogout: () => void }) {
  const items = [
    { k: "dashboard", n: "01", label: "Dashboard" },
    { k: "projects",  n: "02", label: "Proyek" },
    { k: "team",      n: "03", label: "Tim & Absensi" },
    { k: "billing",   n: "04", label: "Tagihan" },
    { k: "material",  n: "05", label: "Material" },
    { k: "finance",   n: "06", label: "Keuangan" },
    { k: "timeline",  n: "07", label: "Timeline" },
    { k: "users",     n: "08", label: "Pengguna" },
  ] as const;

  return (
    <aside className="flex flex-col px-4 py-5" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", borderRight: "1px solid var(--kas-ink)" }}>
      <div className="flex items-center gap-3 mb-7">
        <KasBrandMark size={28} />
        <div className="flex flex-col leading-none">
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1, fontWeight: 500 }}>
            KAS<span style={{ color: "var(--kas-cobalt)" }}>.</span>
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", marginTop: 3, textTransform: "uppercase" }}>Super Admin</span>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 10 }}>Menu</div>
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
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.15)" : "none",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                color: active ? "var(--kas-paper)" : "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{it.n}</span>
              <span>{it.label}</span>
              {active && <span className="inline-block" style={{ width: 6, height: 6, background: "var(--kas-cobalt)" }} />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 10 }}>Sesi</div>
        <div className="flex items-center gap-2.5 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="grid place-items-center" style={{ width: 28, height: 28, background: "var(--kas-cobalt)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 12, fontWeight: 600 }}>{session.short[0]}</div>
          <div className="flex-1">
            <div style={{ fontSize: 13, fontWeight: 600 }}>{session.name}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Super Admin</div>
          </div>
          <button onClick={onLogout} style={{ border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "rgba(255,255,255,0.7)", padding: "4px 8px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" }}>Out</button>
        </div>
      </div>
    </aside>
  );
}

export default function SuperAdmin({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const [view, setView] = useState<{ page: Page; projectId?: string }>({ page: "dashboard" });
  const sess = session || { name: "Ricky", short: "RC" };

  return (
    <div className="h-full grid overflow-hidden" style={{ gridTemplateColumns: "220px 1fr", background: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}>
      <Sidebar view={view} setView={setView} session={sess} onLogout={onLogout} />
      <main className="overflow-y-auto">
        {view.page === "dashboard" && <Dashboard goProject={(id) => setView({ page: "project", projectId: id })} goProjects={() => setView({ page: "projects" })} />}
        {view.page === "projects" && <ProjectsList goProject={(id) => setView({ page: "project", projectId: id })} />}
        {view.page === "project" && <ProjectDetail id={view.projectId!} back={() => setView({ page: "projects" })} />}
        {view.page === "team" && <TeamPage />}
        {view.page === "billing" && <BillingPage />}
        {view.page === "material" && <MaterialPage />}
        {view.page === "finance"  && <FinancePage />}
        {view.page === "timeline" && <TimelinePage />}
        {view.page === "users" && <UsersPage />}
      </main>
    </div>
  );
}
