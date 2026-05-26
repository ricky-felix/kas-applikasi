"use client";
import { PROJECTS, WORKERS, TODAY_SHORT, fmtIDRshort } from "@/lib/data";
import { MonoLabel, StatusPill } from "../ui";
import { TopBar, SectionHead, Footer } from "./shared";

export default function Dashboard({ goProject, goProjects }: { goProject: (id: string) => void; goProjects: () => void }) {
  const active = PROJECTS.filter((p) => p.status === "Active");
  const outstanding = PROJECTS.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const workersOnSite = WORKERS.filter((w) => active.some((p) => p.assigned.includes(w.id))).length;

  const stats = [
    { n: "01", label: "Proyek aktif",        value: String(active.length).padStart(2, "0"), sub: `${PROJECTS.length} total`,           accentColor: "var(--kas-cobalt)" },
    { n: "02", label: "Pendapatan bulan ini", value: fmtIDRshort(24850000),                  sub: "+12% vs Apr",                         accentColor: "var(--kas-moss)" },
    { n: "03", label: "Belum dibayar",        value: fmtIDRshort(outstanding),               sub: "2 termin pending",                    accentColor: "var(--kas-rust)" },
    { n: "04", label: "Pekerja di lapangan",  value: String(workersOnSite).padStart(2, "0"), sub: `${WORKERS.length} pekerja total`,     accentColor: "var(--kas-ochre)" },
  ];

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Dashboard" />
      <SectionHead no="01" kicker={`${TODAY_SHORT} · LIVE`}>
        Empat angka, <em>satu pagi.</em>
      </SectionHead>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {stats.map((s, i) => (
          <div key={i} className="p-5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none", borderTop: `3px solid ${s.accentColor}` }}>
            <div className="flex items-center gap-2">
              <MonoLabel size={10}>{s.n}</MonoLabel>
              <span className="flex-1" style={{ height: 1, background: "var(--kas-line-2)" }} />
            </div>
            <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, marginTop: 12, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 44, lineHeight: 1.0, letterSpacing: "-0.02em", marginTop: 8, color: i === 2 ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.value}</div>
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
                {a.action.includes("Hadir") && <span className="inline-block" style={{ width: 6, height: 6, background: "var(--kas-cobalt)" }} />}
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
