import { PROJECTS, BILLING, fmtIDR } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function InvoicePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const project = PROJECTS.find((p) => p.code.toLowerCase() === code.toLowerCase());
  if (!project) notFound();

  const outstanding = project.contractValue - project.paid;
  const paidBilling = BILLING.filter((b) => b.status === "Paid");
  const pendingBilling = BILLING.filter((b) => b.status === "Pending");
  const totalPaid = paidBilling.reduce((s, b) => s + b.amount, 0);

  const waText = encodeURIComponent(
    `Halo Bpk/Ibu ${project.client.name.replace("Bpk. ", "").replace("Ibu ", "")},\n\nBerikut konfirmasi tagihan proyek *${project.name}*:\n\nTotal Kontrak: ${fmtIDR(project.contractValue)}\nTerbayar: ${fmtIDR(project.paid)}\nSisa: ${fmtIDR(outstanding)}\n\nMohon dapat segera melakukan pembayaran ke rekening BCA:\nNo. Rek: 1234567890\nA/N: CV Karya Agung Sejati\n\nTerima kasih.\n— Tim CV Karya Agung Sejati`
  );
  const waUrl = `https://wa.me/${project.client.phone.replace(/\D/g, "").replace(/^62/, "62")}?text=${waText}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--kas-bg)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "var(--font-manrope), sans-serif",
        color: "var(--kas-ink)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "var(--kas-paper)",
          border: "1px solid var(--kas-ink)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "var(--kas-ink)",
            color: "var(--kas-paper)",
            padding: "28px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "var(--kas-paper)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-newsreader), serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--kas-ink)",
                    lineHeight: 1,
                  }}
                >
                  K
                </span>
                <div
                  style={{
                    position: "absolute",
                    bottom: 3,
                    right: 3,
                    width: 5,
                    height: 5,
                    background: "var(--kas-orange)",
                    borderRadius: "50%",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-newsreader), serif",
                  fontWeight: 500,
                  fontSize: 20,
                  letterSpacing: "-0.01em",
                  color: "var(--kas-paper)",
                }}
              >
                Tauke
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(251,248,241,0.6)",
              }}
            >
              CV Karya Agung Sejati
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: "rgba(251,248,241,0.45)",
                marginTop: 2,
              }}
            >
              Jl. Setia Budi Pasar 2, Medan · +62 812 6011 8800
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-newsreader), serif",
                fontSize: 32,
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 1,
                color: "var(--kas-paper)",
              }}
            >
              Tagihan
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "rgba(251,248,241,0.6)",
                marginTop: 4,
                textTransform: "uppercase",
              }}
            >
              {project.code}
            </div>
          </div>
        </div>

        {/* Project info */}
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--kas-line)" }}>
          <div
            style={{
              fontFamily: "var(--font-newsreader), serif",
              fontSize: 22,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              marginBottom: 12,
            }}
          >
            {project.name}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 16px",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "var(--kas-ink-3)",
            }}
          >
            <div><strong style={{ color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Klien</strong><br />{project.client.name}</div>
            <div><strong style={{ color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Lokasi</strong><br />{project.client.address}</div>
            <div><strong style={{ color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Mulai</strong><br />{project.start}</div>
            <div><strong style={{ color: "var(--kas-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Estimasi Selesai</strong><br />{project.endEst}</div>
          </div>
        </div>

        {/* Billing stages */}
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--kas-line)" }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--kas-ink-3)",
              marginBottom: 12,
            }}
          >
            Rincian Pembayaran
          </div>
          {BILLING.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderTop: "1px solid var(--kas-line-2)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-newsreader), serif",
                    fontSize: 16,
                    lineHeight: 1.2,
                  }}
                >
                  {b.stage}
                </div>
                {b.date && (
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 9,
                      color: "var(--kas-ink-3)",
                      marginTop: 2,
                      letterSpacing: "0.1em",
                    }}
                  >
                    Dibayar {b.date}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: b.status === "Paid" ? "var(--kas-ink)" : "var(--kas-orange)",
                  }}
                >
                  {fmtIDR(b.amount)}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 8,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "3px 7px",
                    background: b.status === "Paid" ? "var(--kas-green-soft)" : "var(--kas-orange-soft)",
                    color: b.status === "Paid" ? "var(--kas-green)" : "var(--kas-orange-ink)",
                  }}
                >
                  {b.status === "Paid" ? "Lunas" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary totals */}
        <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Total Kontrak</span>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{fmtIDR(project.contractValue)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Sudah Dibayar</span>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-green)" }}>−{fmtIDR(totalPaid)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 12,
              borderTop: "1px solid var(--kas-ink)",
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Sisa Tagihan
            </span>
            <span
              style={{
                fontFamily: "var(--font-newsreader), serif",
                fontSize: 26,
                fontWeight: 500,
                color: outstanding > 0 ? "var(--kas-orange)" : "var(--kas-green)",
                lineHeight: 1,
              }}
            >
              {fmtIDR(outstanding)}
            </span>
          </div>
        </div>

        {/* Bank info */}
        <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--kas-line)" }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--kas-ink-3)",
              marginBottom: 12,
            }}
          >
            Informasi Rekening
          </div>
          <div
            style={{
              background: "var(--kas-paper-2)",
              border: "1px solid var(--kas-line)",
              padding: "16px 20px",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "4px 24px",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Bank Central Asia (BCA)</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, letterSpacing: "0.04em" }}>1234567890</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.06em" }}>A/N: CV Karya Agung Sejati</div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "6px 10px",
                border: "1px solid var(--kas-ink)",
                color: "var(--kas-ink)",
                whiteSpace: "nowrap",
              }}
            >
              BCA
            </div>
          </div>
        </div>

        {/* CTA */}
        {outstanding > 0 && (
          <div style={{ padding: "24px 32px" }}>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "16px 24px",
                background: "var(--kas-ink)",
                color: "var(--kas-paper)",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4zm-4.5 16a11.7 11.7 0 01-6-1.6l-.4-.3-3.7 1 1-3.6-.3-.4A11.6 11.6 0 1115.5 20z" />
              </svg>
              Hubungi via WhatsApp
            </a>
            <div
              style={{
                textAlign: "center",
                marginTop: 12,
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--kas-ink-3)",
              }}
            >
              Halaman ini dibuat otomatis oleh sistem Tauke.
            </div>
          </div>
        )}

        {outstanding <= 0 && (
          <div style={{ padding: "24px 32px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "var(--kas-green-soft)",
                color: "var(--kas-green)",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Proyek Lunas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
