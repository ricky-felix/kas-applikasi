import type { AnalyticsData } from "./types";
import { HBar, SecLabel, SecTitle } from "./primitives";

export function FunnelSection({ d }: { d: AnalyticsData }) {
  const funnel = d.website.funnel;
  const steps = [
    { label: "Pengunjung web",          value: funnel.visitors,       pct: 100 },
    { label: "Inquiry dikirim",         value: funnel.inquiries,      pct: (funnel.inquiries      / funnel.visitors) * 100 },
    { label: "Hubungi via WA",          value: funnel.waContacts,     pct: (funnel.waContacts     / funnel.visitors) * 100 },
    { label: "Proyek ditanda tangani",  value: funnel.projectsSigned, pct: (funnel.projectsSigned / funnel.visitors) * 100 },
  ];

  return (
    <section className="mb-12">
      <SecLabel no="02" kicker="Corong Konversi" source="posthog-web" />
      <SecTitle>Dari pengunjung <em>ke proyek.</em></SecTitle>

      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {steps.map((step, i) => {
          const convFromPrev = i > 0
            ? ((steps[i].value / steps[i - 1].value) * 100).toFixed(0) + "% dari langkah sebelumnya"
            : "Titik masuk";
          return (
            <div key={i} className="grid items-center gap-6 py-3.5" style={{ gridTemplateColumns: "180px 1fr 90px 180px", borderBottom: "1px solid var(--kas-line)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 500 }}>{step.label}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{convFromPrev}</div>
              </div>
              <HBar pct={step.pct} h={6} color={i === 0 ? "var(--kas-cobalt)" : i === steps.length - 1 ? "var(--kas-moss)" : "var(--kas-ink)"} />
              <div style={{ textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 24, fontWeight: 500 }}>{step.value}</div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{step.pct.toFixed(1)}% dari pengunjung</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
