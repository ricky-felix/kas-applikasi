"use client";
import { WORKERS, fmtIDR } from "@/lib/data";
import { MonoLabel } from "../ui";
import { TopBar, SectionHead, Footer } from "./shared";

export default function TeamPage() {
  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Tim & Absensi" />
      <SectionHead no="—" kicker={`${WORKERS.length} PEKERJA`}>Tim, <em>lengkap.</em></SectionHead>
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0" }}>Pekerja</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Peran</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Tarif/Hari</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Hari Hadir (30 hari)</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Belum Dibayar</th>
          </tr>
        </thead>
        <tbody>
          {WORKERS.map((w, i) => {
            const days = [22,18,20,24,19,15][i] || 18;
            const owed = (days % 5) * w.rate;
            return (
              <tr key={w.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "16px 14px 16px 0" }}>
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500 }}>{w.short}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{w.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 14px", color: "var(--kas-ink-2)" }}>{w.role}</td>
                <td style={{ padding: "16px 14px", fontFamily: "var(--font-jetbrains), monospace" }}>{fmtIDR(w.rate)}</td>
                <td style={{ padding: "16px 14px" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="relative" style={{ width: 120, height: 4, background: "var(--kas-line-2)" }}>
                      <div className="absolute inset-y-0 left-0" style={{ width: `${(days / 30) * 100}%`, background: "var(--kas-ink)" }} />
                    </div>
                    <MonoLabel size={11}>{days}/30</MonoLabel>
                  </div>
                </td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", color: owed > 0 ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>{owed > 0 ? fmtIDR(owed) : "Lunas"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer />
    </div>
  );
}
