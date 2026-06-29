"use client";
import { useState, useEffect, useRef } from "react";
import {
  payrollTotal, fmtIDRshort, fmtIDR,
  type CashAdvance, type DailyAllowance,
} from "@/lib/data";
import { useWorkers, useCashAdvances, useDailyAllowances, usePayroll } from "@/lib/stores";
import { Kicker, DisplayHeading } from "@/components/primitives";
import { BossConfirmDialog } from "@/components/admin/boss-confirm";
import { WORKER_JABATAN } from "@/components/login/types";

type WorkerDetail = { wid: string } | null;

export default function AMWorkerManagement({ onBack, toast }: { onBack: () => void; toast: (m: string) => void }) {
  const [search, setSearch]       = useState("");
  const [detail, setDetail]       = useState<WorkerDetail>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]     = useState("");
  const [newPhone, setNewPhone]   = useState("");
  const [newPin, setNewPin]       = useState("");
  const [newRate, setNewRate]     = useState("");
  const [newJabatan, setNewJabatan] = useState<string>(WORKER_JABATAN[1] ?? WORKER_JABATAN[0]);

  const WORKERS = useWorkers();
  const PAYROLL_MAY = usePayroll();
  const liveAdvances = useCashAdvances();
  const liveAllowances = useDailyAllowances();

  // Ledger state — keyed by workerId
  const [paid, setPaid]           = useState<Set<string>>(new Set());
  const [confirmPay, setConfirmPay] = useState<string | null>(null);
  const [advances, setAdvances]   = useState<CashAdvance[]>([]);
  const [allowances, setAllowances] = useState<DailyAllowance[]>([]);

  // Seed editable ledgers once from the live data when it first arrives.
  const advSeeded = useRef(false);
  useEffect(() => {
    if (!advSeeded.current && liveAdvances.length) {
      setAdvances(liveAdvances);
      advSeeded.current = true;
    }
  }, [liveAdvances]);
  const allowSeeded = useRef(false);
  useEffect(() => {
    if (!allowSeeded.current && liveAllowances.length) {
      setAllowances(liveAllowances);
      allowSeeded.current = true;
    }
  }, [liveAllowances]);

  // Add kasbon form
  const [addKasbon, setAddKasbon] = useState<string | null>(null);
  const [kasbonAmt, setKasbonAmt] = useState("");
  const [kasbonNote, setKasbonNote] = useState("");

  // Add tunjangan form
  const [addTunjangan, setAddTunjangan] = useState<string | null>(null);
  const [tunjanganType, setTunjanganType] = useState<DailyAllowance["type"]>("makan");
  const [tunjanganAmt, setTunjanganAmt] = useState("");

  const filtered = WORKERS.filter((w) => {
    const q = search.toLowerCase();
    return !q || w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q) || w.phone.includes(q);
  });

  const handleCreate = () => {
    if (!newName.trim() || !newPhone.trim() || !newPin.trim()) { toast("Isi semua kolom wajib."); return; }
    toast(`Akun ${newName.trim().split(" ")[0]} (${newJabatan}) dibuat.`);
    setShowCreate(false);
    setNewName(""); setNewPhone(""); setNewPin(""); setNewRate("");
    setNewJabatan(WORKER_JABATAN[1] ?? WORKER_JABATAN[0]);
  };

  const handleAddKasbon = (wid: string) => {
    const amt = Number(kasbonAmt);
    if (!amt || amt <= 0) { toast("Jumlah tidak valid."); return; }
    const entry: CashAdvance = { id: `ca-${Date.now()}`, workerId: wid, date: "Hari ini", amount: amt, note: kasbonNote.trim() || "Kasbon" };
    setAdvances((prev) => [...prev, entry]);
    toast(`Kasbon Rp ${fmtIDRshort(amt)} dicatat.`);
    setAddKasbon(null); setKasbonAmt(""); setKasbonNote("");
  };

  const handleAddTunjangan = (wid: string) => {
    const amt = Number(tunjanganAmt);
    if (!amt || amt <= 0) { toast("Jumlah tidak valid."); return; }
    const label = tunjanganType === "makan" ? "Uang Makan" : tunjanganType === "bensin" ? "Uang Bensin" : "Lain-lain";
    const entry: DailyAllowance = { id: `da-${Date.now()}`, workerId: wid, date: "Hari ini", type: tunjanganType, amount: amt };
    setAllowances((prev) => [...prev, entry]);
    toast(`${label} Rp ${fmtIDRshort(amt)} dicatat.`);
    setAddTunjangan(null); setTunjanganAmt(""); setTunjanganType("makan");
  };

  const handlePay = (wid: string) => {
    setPaid((prev) => { const n = new Set(prev); n.add(wid); return n; });
    toast("Pembayaran dicatat. Lunas.");
    setConfirmPay(null);
  };

  // ── Detail / Ledger view ──────────────────────────────────────────────────
  if (detail) {
    const w         = WORKERS.find((x) => x.id === detail.wid)!;
    const payroll   = PAYROLL_MAY.find((p) => p.workerId === w.id);
    const gross     = payroll ? payrollTotal(payroll) : 0;
    const wAdvances = advances.filter((a) => a.workerId === w.id);
    const wAllowances = allowances.filter((a) => a.workerId === w.id);
    const totalKasbon   = wAdvances.reduce((s, a) => s + a.amount, 0);
    const totalAllowance = wAllowances.reduce((s, a) => s + a.amount, 0);
    const net       = Math.max(0, gross - totalKasbon - totalAllowance);
    const isLunas   = paid.has(w.id);

    return (
      <div className="px-5 pt-4 pb-6">
        {confirmPay === w.id && (
          <BossConfirmDialog
            message="Apakah bos sudah menyetujui pembayaran upah ini?"
            onConfirm={() => handlePay(w.id)}
            onCancel={() => setConfirmPay(null)}
          />
        )}

        <button onClick={() => setDetail(null)}
          style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 12px" }}>
          ← Kembali
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="grid place-items-center" style={{ width: 44, height: 44, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontWeight: 500 }}>{w.short}</div>
          <div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20 }}>{w.name}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{w.role}{w.isKepalaProyek ? " · Kepala Proyek" : ""}</div>
          </div>
        </div>

        {/* Settlement ledger */}
        <Kicker no="A" label="PERHITUNGAN UPAH · MEI 2026" />
        <div className="mt-3" style={{ border: "1px solid var(--kas-ink)" }}>
          {/* Gross */}
          <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>Gaji Kotor</div>
              {payroll && (
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", marginTop: 1, letterSpacing: "0.06em" }}>
                  {payroll.projects.map(p => `${p.daysPresent + p.daysHalf * 0.5}h · ${p.code}`).join(" + ")}
                </div>
              )}
            </div>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontWeight: 500 }}>{fmtIDRshort(gross)}</span>
          </div>

          {/* Allowances */}
          {totalAllowance > 0 && (
            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
                  — Tunjangan Harian Sudah Dibayar
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", marginTop: 1, letterSpacing: "0.06em" }}>
                  {wAllowances.filter(a => a.type === "makan").length > 0 && `Makan ${wAllowances.filter(a => a.type === "makan").length}× `}
                  {wAllowances.filter(a => a.type === "bensin").length > 0 && `Bensin ${wAllowances.filter(a => a.type === "bensin").length}×`}
                </div>
              </div>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontWeight: 500, color: "var(--kas-rust)" }}>− {fmtIDRshort(totalAllowance)}</span>
            </div>
          )}

          {/* Kasbon */}
          {totalKasbon > 0 && (
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-center">
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
                  — Kasbon / Hutang
                </div>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontWeight: 500, color: "var(--kas-rust)" }}>− {fmtIDRshort(totalKasbon)}</span>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {wAdvances.map((a) => (
                  <div key={a.id} className="flex justify-between items-center">
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.06em" }}>{a.date} · {a.note}</span>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{fmtIDRshort(a.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Net */}
          <div className="flex justify-between items-center px-4 py-4" style={{ background: isLunas ? "var(--kas-moss-soft)" : "var(--kas-ink)", color: isLunas ? "var(--kas-moss-ink)" : "var(--kas-paper)" }}>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
                {isLunas ? "Sudah Dibayar Tunai" : "Dibayar Tunai"}
              </div>
            </div>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 500 }}>{fmtIDR(net)}</span>
          </div>
        </div>

        {/* Pay button */}
        {!isLunas && gross > 0 && (
          <button
            type="button"
            onClick={() => setConfirmPay(w.id)}
            className="w-full mt-3 py-4"
            style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
          >
            Bayar Tunai {fmtIDR(net)} →
          </button>
        )}

        {/* Add kasbon */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <Kicker no="B" label="KASBON / HUTANG" />
            <button
              type="button"
              onClick={() => setAddKasbon(addKasbon ? null : w.id)}
              style={{ border: "1px solid var(--kas-ink)", background: addKasbon ? "var(--kas-ink)" : "transparent", color: addKasbon ? "var(--kas-paper)" : "var(--kas-ink)", padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
            >
              {addKasbon ? "✕" : "+ Kasbon"}
            </button>
          </div>

          {addKasbon === w.id && (
            <div className="mb-3 p-3" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
              <div className="flex flex-col gap-2">
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 3 }}>Jumlah (Rp)</div>
                  <input type="number" value={kasbonAmt} onChange={(e) => setKasbonAmt(e.target.value)} placeholder="200000"
                    style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, padding: "8px 10px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 3 }}>Keterangan</div>
                  <input type="text" value={kasbonNote} onChange={(e) => setKasbonNote(e.target.value)} placeholder="Alasan kasbon..."
                    style={{ width: "100%", border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "8px 10px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div className="grid gap-2 mt-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button onClick={() => { setAddKasbon(null); setKasbonAmt(""); setKasbonNote(""); }}
                  style={{ border: "1px solid var(--kas-line)", background: "transparent", padding: "9px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Batal</button>
                <button onClick={() => handleAddKasbon(w.id)}
                  style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "9px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Catat</button>
              </div>
            </div>
          )}

          {wAdvances.length === 0 && !addKasbon && (
            <div className="py-4 text-center" style={{ border: "1px dashed var(--kas-line)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Tidak ada kasbon bulan ini
            </div>
          )}
        </div>

        {/* Tunjangan harian */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <Kicker no="C" label={`TUNJANGAN HARIAN · ${wAllowances.length} ENTRI`} />
            <button
              type="button"
              onClick={() => setAddTunjangan(addTunjangan ? null : w.id)}
              style={{ border: "1px solid var(--kas-ink)", background: addTunjangan ? "var(--kas-ink)" : "transparent", color: addTunjangan ? "var(--kas-paper)" : "var(--kas-ink)", padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
            >
              {addTunjangan ? "✕" : "+ Catat"}
            </button>
          </div>

          {addTunjangan === w.id && (
            <div className="mb-3 p-3" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
              <div className="flex flex-col gap-2">
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 3 }}>Jenis</div>
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    {(["makan", "bensin", "lain-lain"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setTunjanganType(t)}
                        style={{ border: `1px solid ${tunjanganType === t ? "var(--kas-ink)" : "var(--kas-line)"}`, background: tunjanganType === t ? "var(--kas-ink)" : "var(--kas-paper)", color: tunjanganType === t ? "var(--kas-paper)" : "var(--kas-ink-3)", padding: "7px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                        {t === "makan" ? "Makan" : t === "bensin" ? "Bensin" : "Lain-lain"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 3 }}>Jumlah (Rp)</div>
                  <input type="number" value={tunjanganAmt} onChange={(e) => setTunjanganAmt(e.target.value)}
                    placeholder={tunjanganType === "makan" ? "25000" : tunjanganType === "bensin" ? "20000" : "0"}
                    style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, padding: "8px 10px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div className="grid gap-2 mt-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button type="button" onClick={() => { setAddTunjangan(null); setTunjanganAmt(""); setTunjanganType("makan"); }}
                  style={{ border: "1px solid var(--kas-line)", background: "transparent", padding: "9px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Batal</button>
                <button type="button" onClick={() => handleAddTunjangan(w.id)}
                  style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "9px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Catat</button>
              </div>
            </div>
          )}

          {wAllowances.length === 0 && !addTunjangan ? (
            <div className="py-4 text-center" style={{ border: "1px dashed var(--kas-line)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Belum ada tunjangan bulan ini
            </div>
          ) : (
            <div style={{ borderTop: "1px solid var(--kas-line)" }}>
              {wAllowances.map((a) => (
                <div key={a.id} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>
                    {a.date} · {a.type === "makan" ? "Uang Makan" : a.type === "bensin" ? "Uang Bensin" : "Lain-lain"}
                  </span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-2)" }}>{fmtIDRshort(a.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="px-5 pt-4 pb-6">
      <button onClick={onBack}
        style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 12px" }}>
        ← Kembali
      </button>

      <Kicker no="B" label={`${WORKERS.length} PEKERJA TERDAFTAR`} />
      <div className="flex items-baseline justify-between">
        <DisplayHeading size={26}>Manajemen,<br /><em>pekerja.</em></DisplayHeading>
        <button onClick={() => setShowCreate(!showCreate)}
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "9px 12px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}>
          + Baru
        </button>
      </div>

      {showCreate && (
        <div className="mt-3 p-4" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 12 }}>FORM CEPAT · Pekerja Baru</div>
          <div className="flex flex-col gap-2.5">
            {[
              { ph: "Nama lengkap *",         val: newName,  set: setNewName,  type: "text"   },
              { ph: "Nomor HP (08xx) *",      val: newPhone, set: setNewPhone, type: "tel"    },
              { ph: "Kode akses 6 karakter *",val: newPin,   set: setNewPin,   type: "text"   },
            ].map((f, i) => (
              <input key={i} type={f.type} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                className="w-full px-3 py-2.5"
                style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, outline: "none" }} />
            ))}
            <select
              value={newJabatan}
              onChange={(e) => setNewJabatan(e.target.value)}
              className="w-full px-3 py-2.5"
              style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, outline: "none", cursor: "pointer" }}
            >
              {WORKER_JABATAN.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <input type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="Tarif harian (Rp)"
              className="w-full px-3 py-2.5"
              style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, outline: "none" }} />
          </div>
          <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button onClick={() => setShowCreate(false)} style={{ border: "1px solid var(--kas-line)", background: "transparent", padding: "10px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
            <button onClick={handleCreate} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Simpan</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mt-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, jabatan, nomor HP..."
          className="w-full px-3.5 py-3 pr-9"
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink)", outline: "none" }} />
        {search ? (
          <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2"
            style={{ transform: "translateY(-50%)", border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}>✕</button>
        ) : (
          <span className="absolute right-3 top-1/2 pointer-events-none" style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-4)" }}>⌕</span>
        )}
      </div>

      {search && (
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8 }}>
          {filtered.length} hasil untuk &ldquo;{search}&rdquo;
        </div>
      )}

      {/* Worker list */}
      <div className="mt-3" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {filtered.length === 0 ? (
          <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Tidak ditemukan</div>
        ) : filtered.map((w) => {
          const payroll     = PAYROLL_MAY.find((p) => p.workerId === w.id);
          const gross       = payroll ? payrollTotal(payroll) : 0;
          const totalKasbon = advances.filter(a => a.workerId === w.id).reduce((s, a) => s + a.amount, 0);
          const totalAllowance = allowances.filter(a => a.workerId === w.id).reduce((s, a) => s + a.amount, 0);
          const net         = Math.max(0, gross - totalKasbon - totalAllowance);
          const isLunas     = paid.has(w.id);

          return (
            <div key={w.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setDetail({ wid: w.id })}>
                <div className="grid place-items-center" style={{ width: 36, height: 36, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 14 }}>{w.short}</div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{w.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>
                    {w.role}{w.isKepalaProyek ? " · Kepala Proyek" : ""}
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-4)" }}>→</span>
              </div>

              {gross > 0 && (
                <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px dashed var(--kas-line-2)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
                      Dibayar Tunai
                    </div>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500, marginTop: 1, color: isLunas ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                      {fmtIDRshort(net)}
                    </div>
                    {(totalKasbon > 0 || totalAllowance > 0) && (
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", marginTop: 1, letterSpacing: "0.06em" }}>
                        Kotor {fmtIDRshort(gross)}{totalKasbon > 0 ? ` · Kasbon ${fmtIDRshort(totalKasbon)}` : ""}
                      </div>
                    )}
                  </div>
                  {isLunas ? (
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", padding: "3px 8px", background: "var(--kas-moss-soft)", color: "var(--kas-moss-ink)" }}>Lunas</span>
                  ) : (
                    <button type="button" onClick={() => setConfirmPay(w.id)}
                      style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "6px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                      Bayar Tunai
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmPay && (
        <BossConfirmDialog
          message="Apakah bos sudah menyetujui pembayaran upah ini?"
          onConfirm={() => handlePay(confirmPay)}
          onCancel={() => setConfirmPay(null)}
        />
      )}
    </div>
  );
}
