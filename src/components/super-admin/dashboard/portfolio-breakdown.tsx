import { fmtIDRshort } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { SectionHead, Bar } from "../shared";

type ProjectData = {
  id: string; name: string; code: string; category: string;
  marginPct: number; paidPct: number; outstandingPct: number; costPct: number;
  contractValue: number;
};

export function PortfolioBreakdown({ projects }: { projects: ProjectData[] }) {
  return (
    <section className="mt-14">
      <SectionHead no="04" kicker="PORTOFOLIO PROYEK">Kontrak per proyek, <em>terbayar vs tersisa.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        <div className="flex items-center gap-5 py-2" style={{ borderBottom: "1px solid var(--kas-line)" }}>
          {[
            { fill: "var(--kas-ink)",   label: "Sudah dibayar" },
            { fill: "var(--kas-line)",  label: "Belum terbayar" },
            { fill: "var(--kas-ochre)", label: "Biaya ops (dari bayaran)" },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span style={{ display: "inline-block", width: 10, height: 10, background: l.fill }} />
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{l.label}</span>
            </div>
          ))}
        </div>
        {projects.map((p, i) => (
          <div key={p.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <div className="flex justify-between items-baseline mb-2.5">
              <div className="flex items-center gap-3">
                <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
                <div>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17 }}>{p.name}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginLeft: 8, letterSpacing: "0.1em" }}>{p.code} · {p.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: p.marginPct < 0 ? "var(--kas-rust)" : "var(--kas-moss)", fontWeight: 600 }}>
                  Margin {p.marginPct.toFixed(0)}%
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{fmtIDRshort(p.contractValue)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase", minWidth: 56 }}>Tagihan</span>
              <div style={{ flex: 1, display: "flex", height: 8, gap: 1 }}>
                <div style={{ width: `${p.paidPct}%`, background: "var(--kas-ink)", flexShrink: 0 }} />
                <div style={{ width: `${p.outstandingPct}%`, background: "var(--kas-line)", flexShrink: 0 }} />
              </div>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", minWidth: 36, textAlign: "right" }}>{p.paidPct.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase", minWidth: 56 }}>Biaya</span>
              <Bar pct={p.costPct} h={4} color={p.marginPct < 0 ? "var(--kas-rust)" : "var(--kas-ochre)"} />
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, minWidth: 36, textAlign: "right", color: p.marginPct < 0 ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>
                {p.costPct.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
