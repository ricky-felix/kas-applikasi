import { fmtIDR } from "@/lib/data";
import type { Project } from "@/lib/data";
import { PaymentProofUpload } from "./payment-proof-upload";

function WAIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4zm-4.5 16a11.7 11.7 0 01-6-1.6l-.4-.3-3.7 1 1-3.6-.3-.4A11.6 11.6 0 1115.5 20z" />
    </svg>
  );
}

function buildWaUrl(project: Project, outstanding: number): string {
  const name = project.client.name.replace("Bpk. ", "").replace("Ibu ", "");
  const text = encodeURIComponent(
    `Halo Bpk/Ibu ${name},\n\nBerikut konfirmasi tagihan proyek *${project.name}*:\n\nTotal Kontrak: ${fmtIDR(project.contractValue)}\nTerbayar: ${fmtIDR(project.paid)}\nSisa: ${fmtIDR(outstanding)}\n\nMohon dapat segera melakukan pembayaran ke rekening BCA:\nNo. Rek: 1234567890\nA/N: CV Karya Agung Sejati\n\nTerima kasih.\n— CV Karya Agung Sejati\n+62 81 161 7551`
  );
  return `https://wa.me/${project.client.phone.replace(/\D/g, "")}?text=${text}`;
}

export function InvoiceSidebar({ project, totalPaid, outstanding }: { project: Project; totalPaid: number; outstanding: number }) {
  const waUrl = buildWaUrl(project, outstanding);

  return (
    <div className="sticky top-0 self-start h-screen overflow-y-auto border-l flex flex-col" style={{ background: "var(--kas-paper-2)", borderColor: "var(--kas-line)" }}>
      {/* Totals */}
      <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--kas-line)" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 16 }}>
          Ringkasan
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Kontrak</span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{fmtIDR(project.contractValue)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Sudah Dibayar</span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-moss)" }}>−{fmtIDR(totalPaid)}</span>
        </div>
        <div style={{ paddingTop: 14, borderTop: "1px solid var(--kas-ink)" }}>
          <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, color: "var(--kas-ink-3)" }}>
            Sisa Tagihan
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 30, fontWeight: 500, lineHeight: 1, color: outstanding > 0 ? "var(--kas-rust)" : "var(--kas-moss)" }}>
            {fmtIDR(outstanding)}
          </div>
        </div>
      </div>

      {/* Bank info */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--kas-line)" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 12 }}>
          Informasi Rekening
        </div>
        <div style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "14px 16px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
            Bank Central Asia (BCA)
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, letterSpacing: "0.04em" }}>1234567890</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.06em" }}>
            A/N: CV Karya Agung Sejati
          </div>
        </div>
      </div>

      {/* Payment proof upload */}
      <PaymentProofUpload outstanding={outstanding} />

      {/* CTA */}
      <div style={{ padding: "20px 28px" }}>
        {outstanding > 0 ? (
          <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 20px", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}>
            <WAIcon />
            Hubungi via WhatsApp
          </a>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 20px", background: "var(--kas-moss-soft)", color: "var(--kas-moss-ink)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700 }}>
            Proyek Lunas
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
          Dibuat otomatis oleh sistem Tauke.
        </div>
      </div>
    </div>
  );
}
