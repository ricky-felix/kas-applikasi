"use client";
import { useState } from "react";
import { PENDING_REGISTRATIONS, type PendingRegistration } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";

export function PendaftaranSheet({ toast }: { toast?: (m: string) => void }) {
  const [regs, setRegs] = useState<PendingRegistration[]>(
    PENDING_REGISTRATIONS.filter((r) => r.status === "Pending")
  );

  const approve = (id: string, name: string) => {
    setRegs((prev) => prev.filter((r) => r.id !== id));
    toast?.(`Akun ${name} disetujui.`);
  };
  const reject = (id: string, name: string) => {
    setRegs((prev) => prev.filter((r) => r.id !== id));
    toast?.(`Pendaftaran ${name} ditolak.`);
  };

  if (regs.length === 0) {
    return (
      <div className="mt-5 py-8 flex flex-col items-center" style={{ border: "1px dashed var(--kas-line)", background: "var(--kas-paper-2)" }}>
        <MonoLabel size={9}>Tidak ada pendaftaran baru</MonoLabel>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col" style={{ borderTop: "1px solid var(--kas-line)" }}>
      {regs.map((r) => (
        <div key={r.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="grid place-items-center" style={{ width: 38, height: 38, background: "var(--kas-ochre-soft)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, color: "var(--kas-ochre-ink)" }}>
              {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.1 }}>{r.name}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>
                {r.jabatan} · {r.gender === "L" ? "Laki-laki" : "Perempuan"}
              </div>
            </div>
            <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", background: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)", border: "1px solid var(--kas-line)", flexShrink: 0 }}>
              Menunggu
            </span>
          </div>

          <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: "70px 1fr" }}>
            <MonoLabel size={9}>HP</MonoLabel>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{r.phone}</span>
            <MonoLabel size={9}>Tanggal</MonoLabel>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{r.submittedAt}</span>
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button
              type="button"
              onClick={() => approve(r.id, r.name)}
              style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Setujui
            </button>
            <button
              type="button"
              onClick={() => reject(r.id, r.name)}
              style={{ border: "1px solid var(--kas-rust)", background: "transparent", color: "var(--kas-rust)", padding: "10px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Tolak
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
