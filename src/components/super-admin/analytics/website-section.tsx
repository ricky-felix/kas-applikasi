import type { AnalyticsData } from "./types";
import { HBar, SecLabel, SecTitle, ChangeTag } from "./primitives";

export function WebsiteSection({ d }: { d: AnalyticsData }) {
  const monthly = d.website.monthly;
  const cur     = monthly[monthly.length - 1];
  const prev    = monthly[monthly.length - 2];
  const maxVisitors = Math.max(...monthly.map(m => m.visitors));

  const visitorsChg  = Math.round(((cur.visitors  - prev.visitors)  / prev.visitors)  * 100);
  const inquiriesChg = Math.round(((cur.inquiries  - prev.inquiries) / prev.inquiries) * 100);
  const bounceChg    = cur.bounceRate - prev.bounceRate;

  return (
    <section className="mb-12">
      <SecLabel no="01" kicker="karyaagungsejati.com" source="posthog-web" />
      <SecTitle>Situs web, <em>performa bulan ini.</em></SecTitle>

      <div className="grid gap-9" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div>
          <div className="grid mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid var(--kas-line)" }}>
            {[
              { label: "Pengunjung",    value: cur.visitors,        change: <ChangeTag value={visitorsChg} /> },
              { label: "Tampilan",      value: cur.pageViews,       change: <ChangeTag value={Math.round(((cur.pageViews - prev.pageViews) / prev.pageViews) * 100)} /> },
              { label: "Inquiry masuk", value: cur.inquiries,       change: <ChangeTag value={inquiriesChg} /> },
              { label: "Bounce rate",   value: `${cur.bounceRate}%`, change: <ChangeTag value={bounceChg} unit="pp" /> },
            ].map((k, i) => (
              <div key={i} className="p-3.5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none" }}>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 500, lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
                {k.change}
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", marginTop: 2, letterSpacing: "0.08em" }}>vs Apr</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>Tren pengunjung (Jan – Mei)</div>
            <div className="flex items-end gap-2" style={{ height: 64 }}>
              {monthly.map((m, i) => {
                const barH  = Math.round((m.visitors / maxVisitors) * 56);
                const isCur = i === monthly.length - 1;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: isCur ? "var(--kas-ink)" : "var(--kas-ink-3)" }}>{m.visitors}</span>
                    <div style={{ width: "100%", height: barH, background: isCur ? "var(--kas-ink)" : "var(--kas-line)" }} />
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.08em", color: isCur ? "var(--kas-ink)" : "var(--kas-ink-4)", textTransform: "uppercase" }}>{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>Halaman teratas · Mei 2026</div>
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            <div className="grid gap-3 py-2" style={{ gridTemplateColumns: "1fr 48px 48px", borderBottom: "1px solid var(--kas-line)" }}>
              {["Halaman","Views","Avg"].map((h, i) => (
                <span key={i} style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", textAlign: i > 0 ? "right" : "left" }}>{h}</span>
              ))}
            </div>
            {d.website.pages.map((p, i) => {
              const pct = (p.views / d.website.pages[0].views) * 100;
              return (
                <div key={i} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                  <div className="grid gap-3 items-center mb-1.5" style={{ gridTemplateColumns: "1fr 48px 48px" }}>
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{p.label}</span>
                    <span style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: i === 0 ? 600 : 400 }}>{p.views}</span>
                    <span style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{p.avgTime}</span>
                  </div>
                  <HBar pct={pct} h={3} color={i === 0 ? "var(--kas-cobalt)" : "var(--kas-line)"} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
