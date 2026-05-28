"use client";
import { useState } from "react";
import { WORKERS, PAYROLL_MAY, payrollTotal, fmtIDRshort } from "@/lib/data";
import { Kicker, DisplayHeading } from "@/components/primitives";

export default function AMWorkerManagement({ onBack, toast }: { onBack: () => void; toast: (m: string) => void }) {
  const [search, setSearch]         = useState("");
  const [wageStatus, setWageStatus] = useState<Record<string, "pending" | "lunas">>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]     = useState("");
  const [newPhone, setNewPhone]   = useState("");
  const [newPin, setNewPin]       = useState("");
  const [newRate, setNewRate]     = useState("");

  const filtered = WORKERS.filter((w) => {
    const q = search.toLowerCase();
    return !q || w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q) || w.phone.includes(q);
  });

  const handleCreate = () => {
    if (!newName.trim() || !newPhone.trim() || !newPin.trim()) { toast("Isi semua kolom wajib."); return; }
    toast(`Akun ${newName.trim().split(" ")[0]} dibuat.`);
    setShowCreate(false);
    setNewName(""); setNewPhone(""); setNewPin(""); setNewRate("");
  };

  return (
    <div className="px-5 pt-4 pb-6">
      <button
        onClick={onBack}
        style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 12px" }}
      >
        ← Kembali
      </button>

      <Kicker no="B" label={`${WORKERS.length} PEKERJA TERDAFTAR`} />
      <div className="flex items-baseline justify-between">
        <DisplayHeading size={26}>Manajemen,<br /><em>pekerja.</em></DisplayHeading>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "9px 12px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}
        >
          + Baru
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mt-3 p-4" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 12 }}>
            FORM CEPAT · Pekerja Baru
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { ph: "Nama lengkap *", val: newName, set: setNewName, type: "text" },
              { ph: "Nomor HP (08xx) *", val: newPhone, set: setNewPhone, type: "tel" },
              { ph: "Kode akses 6 karakter *", val: newPin, set: setNewPin, type: "text" },
              { ph: "Tarif harian (Rp)", val: newRate, set: setNewRate, type: "number" },
            ].map((f, i) => (
              <input
                key={i}
                type={f.type}
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                className="w-full px-3 py-2.5"
                style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, outline: "none" }}
              />
            ))}
          </div>
          <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button onClick={() => setShowCreate(false)} style={{ border: "1px solid var(--kas-line)", background: "transparent", padding: "10px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
            <button onClick={handleCreate} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Simpan</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, jabatan, nomor HP..."
          className="w-full px-3.5 py-3 pr-9"
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink)", outline: "none" }}
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2"
            style={{ transform: "translateY(-50%)", border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
          >
            ✕
          </button>
        ) : (
          <span className="absolute right-3 top-1/2 pointer-events-none" style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-4)" }}>
            ⌕
          </span>
        )}
      </div>

      {/* Result count */}
      {search && (
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8 }}>
          {filtered.length} hasil untuk &ldquo;{search}&rdquo;
        </div>
      )}

      {/* Worker list */}
      <div className="mt-3" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {filtered.length === 0 ? (
          <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Tidak ditemukan
          </div>
        ) : filtered.map((w) => {
          const payroll = PAYROLL_MAY.find((p) => p.workerId === w.id);
          const wages   = payroll ? payrollTotal(payroll) : 0;
          const status  = wageStatus[w.id] ?? "pending";
          const isLunas = status === "lunas";
          return (
            <div key={w.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
              <div className="grid gap-3 items-center" style={{ gridTemplateColumns: "36px 1fr auto" }}>
                <div className="grid place-items-center" style={{ width: 36, height: 36, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 14 }}>
                  {w.short}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{w.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>
                    {w.role}{w.isKepalaProyek ? " · Kepala Proyek" : ""} · {w.phone}
                  </div>
                </div>
                <button
                  onClick={() => toast(`Reset kode untuk ${w.name.split(" ")[0]}.`)}
                  style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Reset
                </button>
              </div>

              {wages > 0 && (
                <div className="flex items-center justify-between mt-2.5 pt-2" style={{ borderTop: "1px dashed var(--kas-line-2)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>Upah Bulan Ini</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600, marginTop: 2, color: isLunas ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                      {fmtIDRshort(wages)}
                    </div>
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setWageStatus((prev) => ({ ...prev, [w.id]: e.target.value as "pending" | "lunas" }))}
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 9,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "5px 22px 5px 8px",
                      border: `1px solid ${isLunas ? "var(--kas-line)" : "var(--kas-ink)"}`,
                      background: isLunas ? "var(--kas-moss-soft)" : "var(--kas-paper)",
                      color: isLunas ? "var(--kas-moss-ink)" : "var(--kas-ink)",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='square'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 6px center",
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="lunas">Lunas</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
