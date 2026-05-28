import { fmtIDR } from "@/lib/data";
import type { Project, BillingStage } from "@/lib/data";

export function InvoiceMeta({ project, billing }: { project: Project; billing: BillingStage[] }) {
  return (
    <div style={{ borderRight: "1px solid var(--kas-line)" }}>
      {/* Project info */}
      <div style={{ padding: "36px 56px", borderBottom: "1px solid var(--kas-line)" }}>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 20 }}>
          {project.name}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0 32px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.06em", color: "var(--kas-ink-3)" }}>
          <div><strong style={{ display: "block", color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Klien</strong>{project.client.name}</div>
          <div><strong style={{ display: "block", color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Lokasi</strong>{project.client.address}</div>
          <div><strong style={{ display: "block", color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Mulai</strong>{project.start}</div>
          <div><strong style={{ display: "block", color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Estimasi Selesai</strong>{project.endEst}</div>
        </div>
      </div>

      {/* Billing stages */}
      <div style={{ padding: "36px 56px" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 16 }}>
          Rincian Pembayaran
        </div>
        <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {billing.map((b, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 24, padding: "16px 0", borderBottom: "1px solid var(--kas-line)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{b.stage}</div>
                {b.date && (
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>
                    Dibayar {b.date}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, fontWeight: 600, color: b.status === "Paid" ? "var(--kas-ink)" : "var(--kas-rust)" }}>
                {fmtIDR(b.amount)}
              </span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", padding: "4px 10px", background: b.status === "Paid" ? "var(--kas-moss-soft)" : "var(--kas-ochre-soft)", color: b.status === "Paid" ? "var(--kas-moss-ink)" : "var(--kas-ochre-ink)" }}>
                {b.status === "Paid" ? "Lunas" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
