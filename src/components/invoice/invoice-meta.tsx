import { fmtIDR } from "@/lib/data";
import type { Project, BillingStage } from "@/lib/data";

export function InvoiceMeta({ project, billing }: { project: Project; billing: BillingStage[] }) {
  return (
    <div className="lg:border-r" style={{ borderColor: "var(--kas-line)" }}>
      {/* Project info */}
      <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--kas-line)" }}>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 12 }}>
          {project.name}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.06em", color: "var(--kas-ink-3)" }}>
          <div><strong style={{ color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Klien</strong><br />{project.client.name}</div>
          <div><strong style={{ color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Lokasi</strong><br />{project.client.address}</div>
          <div><strong style={{ color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Mulai</strong><br />{project.start}</div>
          <div><strong style={{ color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Estimasi Selesai</strong><br />{project.endEst}</div>
        </div>
      </div>

      {/* Billing stages */}
      <div style={{ padding: "24px 32px" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 12 }}>
          Rincian Pembayaran
        </div>
        {billing.map((b, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--kas-line-2)" }}>
            <div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2 }}>{b.stage}</div>
              {b.date && (
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>
                  Dibayar {b.date}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600, color: b.status === "Paid" ? "var(--kas-ink)" : "var(--kas-rust)" }}>
                {fmtIDR(b.amount)}
              </span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", padding: "3px 7px", background: b.status === "Paid" ? "var(--kas-moss-soft)" : "var(--kas-ochre-soft)", color: b.status === "Paid" ? "var(--kas-moss-ink)" : "var(--kas-ochre-ink)" }}>
                {b.status === "Paid" ? "Lunas" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
