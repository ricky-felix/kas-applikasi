import { PROJECTS } from "@/lib/data";
import { SectionHead } from "../shared";

export function ActivityFeed() {
  const activities = [...PROJECTS[0].activity, ...PROJECTS[1].activity].slice(0, 6);

  return (
    <section>
      <SectionHead no="03" kicker="HARI INI">Aktivitas <em>lapangan.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {activities.map((a, i) => (
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
  );
}
