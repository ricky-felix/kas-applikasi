import { PROJECTS, BILLING, fmtIDR } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const project = PROJECTS.find((p) => p.slug === code);
  if (!project) return { title: "Tagihan tidak ditemukan" };
  return { title: `Tagihan ${project.code} — ${project.name}` };
}

export default async function InvoicePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const project = PROJECTS.find((p) => p.slug === code);
  if (!project) notFound();

  const outstanding = project.contractValue - project.paid;
  const paidBilling = BILLING.filter((b) => b.status === "Paid");
  const totalPaid = paidBilling.reduce((s, b) => s + b.amount, 0);

  const waText = encodeURIComponent(
    `Halo Bpk/Ibu ${project.client.name.replace("Bpk. ", "").replace("Ibu ", "")},\n\nBerikut konfirmasi tagihan proyek *${project.name}*:\n\nTotal Kontrak: ${fmtIDR(project.contractValue)}\nTerbayar: ${fmtIDR(project.paid)}\nSisa: ${fmtIDR(outstanding)}\n\nMohon dapat segera melakukan pembayaran ke rekening BCA:\nNo. Rek: 1234567890\nA/N: CV Karya Agung Sejati\n\nTerima kasih.\n— CV Karya Agung Sejati\n+62 81 161 7551`
  );
  const waUrl = `https://wa.me/${project.client.phone.replace(/\D/g, "").replace(/^62/, "62")}?text=${waText}`;

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-10 lg:py-16"
      style={{ background: "var(--kas-bg)", fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}
    >
      <div
        className="w-full max-w-[600px] lg:max-w-[900px]"
        style={{ background: "var(--kas-paper)", border: "1px solid var(--kas-ink)" }}
      >
        {/* Header — full width */}
        <div
          className="flex justify-between items-start"
          style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "28px 32px" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <rect x="1" y="1" width="30" height="30" stroke="hsl(218,80%,68%)" strokeWidth="2" />
                <rect x="5" y="5" width="22" height="22" rx="4" stroke="hsl(14,75%,68%)" strokeWidth="2" />
                <circle cx="16" cy="16" r="4" fill="hsl(30,10%,97%)" />
              </svg>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 20, letterSpacing: "-0.01em", color: "var(--kas-paper)" }}>
                Tauke
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
              CV Karya Agung Sejati
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginTop: 2, lineHeight: 1.7 }}>
              Jl. William Iskandar Muda (Pancing - Komplek MMTC), Blok E No 12 A, Medan 20223<br />+62 81 161 7551
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontWeight: 400, fontStyle: "italic", lineHeight: 1, color: "var(--kas-paper)" }}>
              Tagihan
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.6)", marginTop: 4, textTransform: "uppercase" }}>
              {project.code}
            </div>
          </div>
        </div>

        {/* Body — two-column on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">

          {/* LEFT: project info + billing stages */}
          <div className="lg:border-r" style={{ borderColor: "var(--kas-line)" }}>
            {/* Project info */}
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--kas-line)" }}>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 12 }}>
                {project.name}
              </div>
              <div
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px",
                  fontFamily: "var(--font-jetbrains), monospace", fontSize: 10,
                  letterSpacing: "0.06em", color: "var(--kas-ink-3)",
                }}
              >
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
              {BILLING.map((b, i) => (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--kas-line-2)" }}
                >
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
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em",
                        textTransform: "uppercase", padding: "3px 7px",
                        background: b.status === "Paid" ? "var(--kas-moss-soft)" : "var(--kas-ochre-soft)",
                        color: b.status === "Paid" ? "var(--kas-moss-ink)" : "var(--kas-ochre-ink)",
                      }}
                    >
                      {b.status === "Paid" ? "Lunas" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: summary totals + bank + CTA (sticky on desktop) */}
          <div
            className="lg:sticky lg:top-8 lg:self-start border-t lg:border-t-0"
            style={{ background: "var(--kas-paper-2)", borderColor: "var(--kas-line)" }}
          >
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

            {/* CTA */}
            <div style={{ padding: "20px 28px" }}>
              {outstanding > 0 ? (
                <>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      padding: "14px 20px", background: "var(--kas-ink)", color: "var(--kas-paper)",
                      fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600,
                      letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4zm-4.5 16a11.7 11.7 0 01-6-1.6l-.4-.3-3.7 1 1-3.6-.3-.4A11.6 11.6 0 1115.5 20z" />
                    </svg>
                    Hubungi via WhatsApp
                  </a>
                </>
              ) : (
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "14px 20px", background: "var(--kas-moss-soft)",
                    color: "var(--kas-moss-ink)", fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
                  }}
                >
                  Proyek Lunas
                </div>
              )}
              <div
                style={{
                  textAlign: "center", marginTop: 12, fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)",
                }}
              >
                Dibuat otomatis oleh sistem Tauke.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
