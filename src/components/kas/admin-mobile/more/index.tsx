"use client";
import { useState } from "react";
import { WORKERS, EXPENSES } from "@/lib/data";
import { Kicker, DisplayHeading } from "../../ui";
import AMExpenseLog from "./expense-log";

export default function AMMore({ session, toast, onLogout }: { session: { name: string; short: string }; toast: (m: string) => void; onLogout: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [subView, setSubView] = useState<null | "expenses">(null);

  if (subView === "expenses") return <AMExpenseLog onBack={() => setSubView(null)} toast={toast} />;

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="05" label="AKUN & PENGATURAN" />
      <DisplayHeading size={28}>Lainnya,<br /><em>{session.name.split(" ").slice(-1)[0]}.</em></DisplayHeading>

      {/* ── Profile card ─────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-3.5 px-4 py-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <div className="grid place-items-center" style={{ width: 48, height: 48, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 20, fontWeight: 500 }}>{session.short}</div>
        <div className="flex-1">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 19, lineHeight: 1.1 }}>{session.name}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.12em", textTransform: "uppercase" }}>ADMINISTRASI · STAF KANTOR</div>
        </div>
      </div>

      {/* ── Log Pengeluaran ───────────────────────────────────────────────── */}
      <div className="mt-5">
        <Kicker no="A" label="KEUANGAN" />
        <button
          onClick={() => setSubView("expenses")}
          className="w-full flex items-center justify-between px-4 py-3.5"
          style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", cursor: "pointer" }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>01</span>
            <div className="text-left">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>Log Pengeluaran</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{EXPENSES.length} entri bulan ini</div>
            </div>
          </div>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-ink-3)" }}>→</span>
        </button>
      </div>

      {/* ── Manajemen Pekerja ─────────────────────────────────────────────── */}
      <div className="mt-5">
        <Kicker no="B" label="MANAJEMEN PEKERJA" />
        <div style={{ borderTop: "1px solid var(--kas-line)" }}>
          {WORKERS.map((w) => (
            <div key={w.id} className="grid gap-3 items-center py-3" style={{ gridTemplateColumns: "32px 1fr auto", borderBottom: "1px solid var(--kas-line-2)" }}>
              <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13 }}>{w.short}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{w.role} · {w.phone}</div>
              </div>
              <button
                onClick={() => toast(`Reset kode untuk ${w.name.split(" ")[0]}.`)}
                style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "5px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
              >
                Reset
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w-full flex items-center justify-center gap-2 py-3.5 mt-2.5"
          style={{ border: "1px dashed var(--kas-ink)", background: "var(--kas-paper)", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}
        >
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 0.5 }}>+</span>
          Buat akun Pekerja baru
        </button>
        {showCreate && (
          <div className="mt-2.5 p-3.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>
              FORM CEPAT · Staf Administrasi hanya boleh buat Pekerja
            </div>
            {["Nama lengkap", "Nomor HP (08xx)", "Kode akses (6 karakter)", "Tarif harian (Rp)"].map((ph, i) => (
              <input key={i} placeholder={ph} className="w-full mb-1.5 px-3 py-2.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }} />
            ))}
            <button
              onClick={() => { toast("Akun Pekerja dibuat."); setShowCreate(false); }}
              className="w-full py-3 mt-1.5"
              style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Simpan Pekerja
            </button>
          </div>
        )}
      </div>

      {/* ── Logout ───────────────────────────────────────────────────────── */}
      <div className="mt-5">
        <button
          onClick={onLogout}
          className="w-full py-3.5"
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
