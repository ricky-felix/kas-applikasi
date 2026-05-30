import { fmtPhone } from "@/lib/data";
import { RegStepper, BackButton } from "./shared";

export function StepRegPending({
  phone,
  name,
  onReset,
}: {
  phone: string;
  name: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col flex-1">
      <RegStepper current={4} />
      <div className="flex flex-col flex-1 px-5 pb-6">
      {/* Heading */}
      <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 34, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 6 }}>
        Pendaftaran<br /><em>dikirim.</em>
      </div>
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 24 }}>
        Akun Anda sedang dalam proses verifikasi
      </div>

      {/* Status badge */}
      <div style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", padding: "20px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--kas-ochre)",
            flexShrink: 0,
            boxShadow: "0 0 0 3px color-mix(in srgb, var(--kas-ochre) 25%, transparent)",
          }} />
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ochre)" }}>
            Menunggu Verifikasi
          </span>
        </div>

        <div style={{ borderTop: "1px solid var(--kas-line)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 2 }}>
              Nomor HP
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, letterSpacing: "0.06em", color: "var(--kas-ink)" }}>
              +62 {fmtPhone(phone)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 2 }}>
              Nama
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, color: "var(--kas-ink)" }}>
              {name}
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "auto" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", lineHeight: 1.7 }}>
          <span style={{ color: "var(--kas-ink)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Siapa yang dapat memverifikasi?</span>
          {" — "}Admin, Super Admin, atau Owner CV Karya Agung Sejati.
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
          <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>ℹ</span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", lineHeight: 1.6 }}>
            Hubungi admin jika akun belum diverifikasi lebih dari 24 jam.
          </span>
        </div>
      </div>

      <div style={{ paddingTop: 24 }}>
        <BackButton label="← Kembali ke halaman masuk" onClick={onReset} />
      </div>
      </div>
    </div>
  );
}
