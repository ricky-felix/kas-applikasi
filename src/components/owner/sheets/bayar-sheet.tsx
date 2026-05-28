import type { Project } from "@/lib/data";
import { fmtIDRshort } from "@/lib/data";

function WAIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4zm-4.5 16a11.7 11.7 0 01-6-1.6l-.4-.3-3.7 1 1-3.6-.3-.4A11.6 11.6 0 1115.5 20z" />
    </svg>
  );
}

export function BayarSheet({ projects }: { projects: Project[] }) {
  const outstanding = projects.filter((p) => p.contractValue - p.paid > 0);
  return (
    <div className="mt-4">
      {outstanding.map((p) => {
        const sisa = p.contractValue - p.paid;
        const waMsg = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nTagihan proyek *${p.name}* senilai *${fmtIDRshort(sisa)}* belum dilunasi.\n\nMohon konfirmasi pembayaran.\n\n— CV Karya Agung Sejati`);
        const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;
        return (
          <div key={p.id} className="py-3.5" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            <div className="flex justify-between items-baseline">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{p.client.name}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-rust)", fontWeight: 600 }}>{fmtIDRshort(sisa)}</div>
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.name}</div>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-2.5 flex items-center gap-2 px-3.5 py-2" style={{ border: "1px solid var(--kas-ink)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", textDecoration: "none", color: "var(--kas-ink)", display: "inline-flex" }}>
              <WAIcon /> Tagih via WhatsApp
            </a>
          </div>
        );
      })}
    </div>
  );
}
