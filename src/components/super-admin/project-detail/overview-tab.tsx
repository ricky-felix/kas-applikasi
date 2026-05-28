import type { Project } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { SectionHead } from "../shared";

export function OverviewTab({ p }: { p: Project }) {
  return (
    <div className="grid gap-9" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
      <div>
        <SectionHead no="01" kicker="CATATAN INTERNAL">Ringkasan, <em>secukupnya.</em></SectionHead>
        <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 19, lineHeight: 1.5, margin: 0, color: "var(--kas-ink-2)" }}>
          Lapisan utama sudah diaplikasikan, sedang menunggu cure 24 jam sebelum primer ke-dua. Akses ke lantai 3 disepakati lewat tangga belakang. Klien minta progres foto tiap Jumat sore.
        </p>
        <div className="grid mt-6" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)" }}>
          {[{ l: "Pekerja Aktif", v: String(p.assigned.length).padStart(2, "0") }, { l: "Hari Berjalan", v: "12" }, { l: "Foto Progres", v: "47" }].map((s, i) => (
            <div key={i} className="py-4 pr-4" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
              <MonoLabel size={10}>{s.l}</MonoLabel>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 4 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionHead no="02" kicker="KONTAK">Klien.</SectionHead>
        <div style={{ borderTop: "1px solid var(--kas-line)" }}>
          {[{ l: "Nama", v: p.client.name }, { l: "Telepon", v: p.client.phone }, { l: "Alamat", v: p.client.address }].map((r, i) => (
            <div key={i} className="grid gap-3.5 py-3.5" style={{ gridTemplateColumns: "120px 1fr", borderBottom: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{r.l}</MonoLabel>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14 }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
