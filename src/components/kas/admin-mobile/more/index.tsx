"use client";
import { useState } from "react";
import { WORKERS, MATERIALS, WORK_REPORTS, MATERIAL_REQUESTS, EXPENSES } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "../../ui";
import AMMaterial from "./material";
import AMWorkReports from "./work-reports";
import AMMaterialRequests from "./material-requests";
import AMExpenseLog from "./expense-log";

export default function AMMore({ session, toast, onLogout }: { session: { name: string; short: string }; toast: (m: string) => void; onLogout: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [subView, setSubView] = useState<null | "material" | "reports" | "requests" | "expenses">(null);

  if (subView === "material")  return <AMMaterial onBack={() => setSubView(null)} />;
  if (subView === "reports")   return <AMWorkReports onBack={() => setSubView(null)} toast={toast} />;
  if (subView === "requests")  return <AMMaterialRequests onBack={() => setSubView(null)} toast={toast} />;
  if (subView === "expenses")  return <AMExpenseLog onBack={() => setSubView(null)} toast={toast} />;

  const lowStockCount = MATERIALS.filter((m) => m.stock <= m.minStock).length;

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="AKUN & PENGATURAN" />
      <DisplayHeading size={28}>Lainnya,<br /><em>{session.name.split(" ").slice(-1)[0]}.</em></DisplayHeading>

      <div className="mt-4 flex items-center gap-3.5 px-4 py-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <div className="grid place-items-center" style={{ width: 48, height: 48, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 20, fontWeight: 500 }}>{session.short}</div>
        <div className="flex-1">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 19, lineHeight: 1.1 }}>{session.name}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.12em", textTransform: "uppercase" }}>ADMINISTRASI · STAF KANTOR</div>
        </div>
      </div>

      <div className="mt-4">
        <Kicker no="02" label="INVENTORI MATERIAL" />
        <button
          onClick={() => setSubView("material")}
          className="w-full flex items-center justify-between px-4 py-3.5"
          style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", cursor: "pointer", borderBottom: "none" }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>05</span>
            <div className="text-left">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>Material & Stok</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{MATERIALS.length} item terdaftar</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lowStockCount > 0 && (
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, padding: "2px 7px", background: "var(--kas-rust-soft)", color: "var(--kas-rust-ink)", letterSpacing: "0.1em" }}>{lowStockCount} tipis</span>
            )}
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-ink-3)" }}>→</span>
          </div>
        </button>
        <div style={{ height: "1px", background: "var(--kas-line)" }} />
      </div>

      <div className="mt-4">
        <Kicker no="03" label="LAPORAN & KEUANGAN" />
        {([
          { key: "reports",  n: "06", label: "Laporan Harian",       sub: `${WORK_REPORTS.length} laporan hari ini`,         badge: null },
          { key: "requests", n: "07", label: "Permintaan Material",  sub: `${MATERIAL_REQUESTS.filter((r) => r.status === "Pending").length} pending persetujuan`, badge: MATERIAL_REQUESTS.filter((r) => r.status === "Pending").length },
          { key: "expenses", n: "08", label: "Log Pengeluaran",      sub: `${EXPENSES.length} entri bulan ini`,              badge: null },
        ] as const).map((item) => (
          <button
            key={item.key}
            onClick={() => setSubView(item.key)}
            className="w-full flex items-center justify-between px-4 py-3.5"
            style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", cursor: "pointer", borderBottom: "none" }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{item.n}</span>
              <div className="text-left">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{item.label}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{item.sub}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.badge != null && item.badge > 0 && (
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, padding: "2px 7px", background: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)", letterSpacing: "0.1em" }}>{item.badge}</span>
              )}
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-ink-3)" }}>→</span>
            </div>
          </button>
        ))}
        <div style={{ height: "1px", background: "var(--kas-line)" }} />
      </div>

      <div className="mt-4">
        <Kicker no="04" label="MANAJEMEN PEKERJA" />
        <div style={{ borderTop: "1px solid var(--kas-line)" }}>
          {WORKERS.slice(0, 4).map((w) => (
            <div key={w.id} className="grid gap-3 items-center py-3" style={{ gridTemplateColumns: "32px 1fr auto", borderBottom: "1px solid var(--kas-line-2)" }}>
              <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13 }}>{w.short}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{w.phone}</div>
              </div>
              <button onClick={() => toast(`Reset kode untuk ${w.name.split(" ")[0]}.`)} style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "5px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Reset</button>
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
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>FORM CEPAT · Staf Administrasi hanya boleh buat Pekerja</div>
            {["Nama lengkap", "Nomor HP (08xx)", "Kode akses (6 karakter)", "Tarif harian (Rp)"].map((ph, i) => (
              <input key={i} placeholder={ph} className="w-full mb-1.5 px-3 py-2.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }} />
            ))}
            <button onClick={() => { toast("Akun Pekerja dibuat."); setShowCreate(false); }} className="w-full py-3 mt-1.5" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>Simpan Pekerja</button>
          </div>
        )}
      </div>

      <div className="mt-5">
        <button onClick={onLogout} className="w-full py-3.5" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>Keluar</button>
      </div>
    </div>
  );
}
