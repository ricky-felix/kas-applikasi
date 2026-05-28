"use client";
import { useState } from "react";
import { DisplayHeading, MonoLabel } from "@/components/primitives";

export default function OwnerCreateSheet({ onDone }: { onDone: () => void }) {
  const [role, setRole] = useState<"admin" | "worker" | null>(null);

  if (!role) {
    return (
      <div className="mt-4">
        <MonoLabel size={10}>Pilih peran yang akan dibuat</MonoLabel>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { k: "admin" as const, l: "Administrasi", sub: "Staf kantor, akses penuh operasional", n: "I" },
            { k: "worker" as const, l: "Pekerja", sub: "Tukang lapangan, hanya absensi", n: "II" },
          ].map((opt) => (
            <button
              key={opt.k}
              onClick={() => setRole(opt.k)}
              className="w-full grid gap-3 items-center text-left p-4"
              style={{ gridTemplateColumns: "40px 1fr auto", border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", cursor: "pointer" }}
            >
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontStyle: "italic", color: "var(--kas-ink-3)" }}>{opt.n}</span>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{opt.l}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.06em" }}>{opt.sub}</div>
              </div>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-ink)" }}>→</span>
            </button>
          ))}
        </div>
        <div className="mt-2 px-3 py-2.5" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", lineHeight: 1.6, textTransform: "uppercase" }}>
          Bapak dapat membuat Staf Administrasi dan Pekerja. Super Admin yang membuat Owner lain.
        </div>
      </div>
    );
  }

  const label = role === "admin" ? "Administrasi" : "Pekerja";
  const fields = [
    { l: "Nama lengkap", ph: "Contoh: Bu Sari" },
    { l: "Nomor HP", ph: "0812 6011 0000" },
    { l: "Kode akses (6)", ph: "ABC123" },
    ...(role === "worker" ? [{ l: "Tarif harian (Rp)", ph: "200.000" }] : []),
  ];

  return (
    <div className="mt-4">
      <button onClick={() => setRole(null)} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 10px" }}>← Ganti peran</button>
      <DisplayHeading size={24}>Form <em>{label}.</em></DisplayHeading>
      <div className="mt-3 flex flex-col gap-2.5">
        {fields.map((f, i) => (
          <div key={i}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>{f.l}</div>
            <input
              placeholder={f.ph}
              className="w-full px-3.5 py-3"
              style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 14 }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={onDone}
        className="w-full mt-4 py-3.5"
        style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
      >
        Buat {label}
      </button>
    </div>
  );
}
