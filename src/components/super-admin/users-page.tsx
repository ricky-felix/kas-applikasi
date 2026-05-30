"use client";
import { useState } from "react";
import { WORKERS, PENDING_REGISTRATIONS, type PendingRegistration } from "@/lib/data";
import { JABATAN_OPTIONS } from "@/components/login/types";
import { MonoLabel } from "@/components/primitives";
import { TopBar, SectionHead, Footer } from "./shared";

export default function UsersPage() {
  const [createRole, setCreateRole] = useState<string | null>(null);
  const [resetInfo, setResetInfo] = useState<{ idx: number; code: string } | null>(null);
  const [editingUser, setEditingUser] = useState<{ name: string; phone: string; role: string; short: string; since: string } | null>(null);
  const [fireConfirm, setFireConfirm] = useState<{ idx: number; name: string; role: string } | null>(null);
  const [firedIdxs, setFiredIdxs] = useState<Set<number>>(new Set());
  const [pendingRegs, setPendingRegs] = useState<PendingRegistration[]>(
    PENDING_REGISTRATIONS.filter((r) => r.status === "Pending")
  );
  const [regToast, setRegToast] = useState<string | null>(null);
  const [completingReg, setCompletingReg] = useState<PendingRegistration | null>(null);
  const [completeJabatan, setCompleteJabatan] = useState("");
  const [completeRate, setCompleteRate] = useState("");
  const [completePin] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());

  const openComplete = (r: PendingRegistration) => {
    setCompletingReg(r);
    setCompleteJabatan(r.jabatan);
    setCompleteRate("");
  };

  const handleActivate = () => {
    if (!completingReg) return;
    if (!completeJabatan || !completeRate) return;
    setPendingRegs((prev) => prev.filter((r) => r.id !== completingReg.id));
    setCompletingReg(null);
    setRegToast(`Akun ${completingReg.name.split(" ")[0]} diaktifkan.`);
    setTimeout(() => setRegToast(null), 2400);
  };

  const handleReject = (id: string, name: string) => {
    setPendingRegs((prev) => prev.filter((r) => r.id !== id));
    setRegToast(`Pendaftaran ${name} ditolak.`);
    setTimeout(() => setRegToast(null), 2400);
  };

  const allUsers = [
    { name: "Ricky", phone: "0811 6000 0001", role: "super_admin", short: "RC", since: "Jan 2024" },
    { name: "Pak Hartono", phone: "0812 6011 8821", role: "owner", short: "PH", since: "Jan 2024" },
    { name: "Bu Sari", phone: "0813 6001 0055", role: "admin", short: "SR", since: "Feb 2024" },
    ...WORKERS.map((w) => ({ name: w.name, phone: w.phone.replace("+62 ", "0"), role: "worker", short: w.short, since: "Mar 2024" })),
  ];
  const users = allUsers.filter((_, i) => !firedIdxs.has(i));
  const counts = {
    super_admin: users.filter((u) => u.role === "super_admin").length,
    owner:       users.filter((u) => u.role === "owner").length,
    admin:       users.filter((u) => u.role === "admin").length,
    worker:      users.filter((u) => u.role === "worker").length,
  };

  const handleResetCode = (i: number) => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    setResetInfo({ idx: i, code });
  };

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Pengguna" />
      <div className="flex justify-between items-end mb-4">
        <SectionHead no="—" kicker={`${users.length} AKUN AKTIF`}>Pengguna, <em>semua peran.</em></SectionHead>
        <div className="flex gap-1.5">
          {["owner","admin","worker"].map((r) => (
            <button key={r} onClick={() => setCreateRole(r)} className="flex items-center gap-2 px-4 py-3" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 0.5 }}>+</span>
              {r === "owner" ? "Owner" : r === "admin" ? "Administrasi" : "Pekerja"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid mb-7" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[
          { r: "super_admin", l: "Super Admin", c: counts.super_admin, canBy: "—" },
          { r: "owner", l: "Owner", c: counts.owner, canBy: "Super Admin" },
          { r: "admin", l: "Administrasi", c: counts.admin, canBy: "Super Admin, Owner" },
          { r: "worker", l: "Pekerja", c: counts.worker, canBy: "Super, Owner, Administrasi" },
        ].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em" }}>{String(s.c).padStart(2, "0")}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Dibuat oleh: {s.canBy}</div>
          </div>
        ))}
      </div>

      {/* ── Pending registrations ──────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>Pendaftaran Baru</span>
          {pendingRegs.length > 0 && (
            <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", background: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)", border: "1px solid var(--kas-line)" }}>
              {pendingRegs.length} MENUNGGU
            </span>
          )}
        </div>
        {pendingRegs.length === 0 ? (
          <div className="py-5 px-6" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Tidak ada pendaftaran baru</span>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--kas-ochre)", background: "var(--kas-ochre-soft)" }}>
            <thead>
              <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
                <th style={{ textAlign: "left", padding: "10px 14px 10px 0", width: 40 }}>#</th>
                <th style={{ textAlign: "left", padding: "10px 14px" }}>Nama</th>
                <th style={{ textAlign: "left", padding: "10px 14px" }}>Nomor HP</th>
                <th style={{ textAlign: "left", padding: "10px 14px" }}>Jabatan</th>
                <th style={{ textAlign: "left", padding: "10px 14px" }}>Tanggal</th>
                <th style={{ textAlign: "right", padding: "10px 14px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegs.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                  <td style={{ padding: "14px 14px 14px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{String(i + 1).padStart(2, "0")}</td>
                  <td style={{ padding: "14px" }}>
                    <div className="flex items-center gap-3">
                      <div className="grid place-items-center" style={{ width: 30, height: 30, background: "var(--kas-paper)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 12 }}>
                        {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>{r.gender === "L" ? "Laki-laki" : "Perempuan"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>
                    {r.phone.slice(0, 4)} {r.phone.slice(4, 8)} {r.phone.slice(8)}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: "var(--kas-paper)", border: "1px solid var(--kas-line)", color: "var(--kas-ink-2)" }}>{r.jabatan}</span>
                  </td>
                  <td style={{ padding: "14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink-3)" }}>{r.submittedAt}</td>
                  <td style={{ padding: "14px", textAlign: "right" }}>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openComplete(r)} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "5px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                      <button onClick={() => handleReject(r.id, r.name)} style={{ background: "transparent", color: "var(--kas-rust)", border: "1px solid var(--kas-rust)", padding: "5px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tolak</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {regToast && (
          <div className="mt-3 px-4 py-2.5" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em" }}>
            {regToast}
          </div>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0", width: 40 }}>#</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Nama</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Nomor HP</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Peran</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Sejak</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <td style={{ padding: "16px 14px 16px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{String(i + 1).padStart(2, "0")}</td>
              <td style={{ padding: "16px 14px" }}>
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center" style={{ width: 30, height: 30, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 12, fontWeight: 500 }}>{u.short}</div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                </div>
              </td>
              <td style={{ padding: "16px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{u.phone}</td>
              <td style={{ padding: "16px 14px" }}>
                <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: u.role === "super_admin" ? "var(--kas-ink)" : u.role === "owner" ? "var(--kas-cobalt-soft)" : u.role === "admin" ? "var(--kas-ochre-soft)" : "var(--kas-paper-2)", color: u.role === "super_admin" ? "var(--kas-paper)" : u.role === "owner" ? "var(--kas-cobalt-ink)" : u.role === "admin" ? "var(--kas-ochre-ink)" : "var(--kas-ink-3)", border: u.role === "super_admin" ? "none" : "1px solid var(--kas-line)" }}>
                  {u.role === "super_admin" ? "Super" : u.role === "owner" ? "Owner" : u.role === "admin" ? "Administrasi" : "Pekerja"}
                </span>
              </td>
              <td style={{ padding: "16px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink-3)" }}>{u.since}</td>
              <td style={{ padding: "16px 14px", textAlign: "right" }}>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleResetCode(i)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Reset Kode</button>
                  <button onClick={() => setEditingUser(u)} style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Edit</button>
                  {u.role !== "super_admin" && (
                    <button
                      onClick={() => setFireConfirm({ idx: allUsers.findIndex((x) => x.name === u.name), name: u.name, role: u.role })}
                      style={{ background: "var(--kas-rust)", color: "var(--kas-paper)", border: "none", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
                    >
                      Pecat
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create User Modal */}
      {createRole && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={() => setCreateRole(null)}>
          <div onClick={(e) => e.stopPropagation()} className="p-7" style={{ width: 520, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)" }}>
            <div className="flex justify-between items-center mb-3.5">
              <MonoLabel size={10}>BUAT AKUN BARU</MonoLabel>
              <button onClick={() => setCreateRole(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 38, fontWeight: 400, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
              <span style={{ fontStyle: "italic", color: "var(--kas-ink-3)", marginRight: 14 }}>{createRole === "owner" ? "I" : createRole === "admin" ? "II" : "III"}</span>
              Akun <em>{createRole === "owner" ? "Owner" : createRole === "admin" ? "Administrasi" : "Pekerja"}.</em>
            </h2>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { l: "Nama lengkap", ph: "Contoh: Budi Hartono", span: 2 },
                { l: "Nomor HP", ph: "0812 6011 0000", span: 1 },
                { l: "Kode akses (6)", ph: "ABC123", span: 1 },
                ...(createRole === "worker" ? [{ l: "Tarif harian (Rp)", ph: "200.000", span: 2 }] : []),
              ].map((f, i) => (
                <div key={i} style={{ gridColumn: `span ${f.span}` }}>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>{f.l}</div>
                  <input placeholder={f.ph} className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2.5 justify-end mt-5">
              <button onClick={() => setCreateRole(null)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "12px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button onClick={() => setCreateRole(null)} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "12px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Buat</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Code Modal */}
      {resetInfo && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={() => setResetInfo(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>RESET KODE AKSES</span>
              <button onClick={() => setResetInfo(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 16px" }}>{users[resetInfo.idx]?.name}. <em>Kode baru.</em></h2>
            <div className="py-5 text-center" style={{ borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)", marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Kode Akses Baru:</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 42, fontWeight: 700, letterSpacing: "0.2em", color: "var(--kas-ink)" }}>{resetInfo.code}</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => { navigator.clipboard?.writeText(resetInfo.code); setResetInfo(null); }}
                style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
              >
                Salin &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={() => setEditingUser(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 440, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>EDIT PENGGUNA</span>
              <button onClick={() => setEditingUser(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 20px" }}>Edit. <em>{editingUser.name.split(" ")[0]}.</em></h2>
            <div className="flex flex-col gap-3">
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Nama Lengkap</div>
                <input defaultValue={editingUser.name} className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Nomor HP</div>
                <input defaultValue={editingUser.phone} className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Peran</div>
                <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: editingUser.role === "super_admin" ? "var(--kas-ink)" : editingUser.role === "owner" ? "var(--kas-cobalt-soft)" : editingUser.role === "admin" ? "var(--kas-ochre-soft)" : "var(--kas-paper-2)", color: editingUser.role === "super_admin" ? "var(--kas-paper)" : editingUser.role === "owner" ? "var(--kas-cobalt-ink)" : editingUser.role === "admin" ? "var(--kas-ochre-ink)" : "var(--kas-ink-3)", border: editingUser.role === "super_admin" ? "none" : "1px solid var(--kas-line)" }}>
                  {editingUser.role === "super_admin" ? "Super" : editingUser.role === "owner" ? "Owner" : editingUser.role === "admin" ? "Administrasi" : "Pekerja"}
                </span>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end mt-5">
              <button onClick={() => setEditingUser(null)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button onClick={() => setEditingUser(null)} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Fire Confirmation Modal */}
      {fireConfirm && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.6)", zIndex: 50 }} onClick={() => setFireConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 440, background: "var(--kas-paper)", border: "2px solid var(--kas-rust)", padding: "28px 32px" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block" style={{ width: 10, height: 10, background: "var(--kas-rust)" }} />
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-rust)" }}>TINDAKAN TIDAK DAPAT DIBATALKAN</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", margin: "0 0 8px" }}>
              Pecat <em>{fireConfirm.name.split(" ")[0]}?</em>
            </h2>
            <p style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "var(--kas-ink-3)", lineHeight: 1.6, margin: "0 0 24px" }}>
              Akun <strong>{fireConfirm.name}</strong> akan dinonaktifkan dan tidak bisa lagi masuk ke sistem. Data riwayat tetap tersimpan.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setFireConfirm(null)}
                style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setFiredIdxs((prev) => new Set([...prev, fireConfirm.idx]));
                  setFireConfirm(null);
                }}
                style={{ background: "var(--kas-rust)", color: "var(--kas-paper)", border: "none", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
              >
                Ya, Pecat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Worker Modal */}
      {completingReg && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={() => setCompletingReg(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 480, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>AKTIVASI AKUN PEKERJA</span>
              <button onClick={() => setCompletingReg(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              Aktifkan. <em>{completingReg.name.split(" ")[0]}.</em>
            </h2>
            <p style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em", margin: "0 0 20px" }}>
              {completingReg.phone} · {completingReg.gender === "L" ? "Laki-laki" : "Perempuan"}
            </p>

            {/* Info from registration — read-only */}
            <div className="mb-5 px-4 py-3" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-4)", marginBottom: 8 }}>Data dari pendaftaran</div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "100px 1fr" }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>Nama</span>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{completingReg.name}</span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>Nomor HP</span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{completingReg.phone}</span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>Jabatan Daftar</span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{completingReg.jabatan}</span>
              </div>
            </div>

            {/* Fields to complete */}
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                  Jabatan Resmi <span style={{ color: "var(--kas-rust)" }}>*</span>
                </div>
                <select
                  value={completeJabatan}
                  onChange={(e) => setCompleteJabatan(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 12px", outline: "none", cursor: "pointer" }}
                >
                  <option value="">Pilih jabatan...</option>
                  {JABATAN_OPTIONS.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                  Tarif Harian (Rp) <span style={{ color: "var(--kas-rust)" }}>*</span>
                </div>
                <input
                  type="number"
                  value={completeRate}
                  onChange={(e) => setCompleteRate(e.target.value)}
                  placeholder="Contoh: 200000"
                  style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Kode Akses (di-generate otomatis)</div>
                <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 18, fontWeight: 700, letterSpacing: "0.22em", flex: 1 }}>{completePin}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Salin &amp; berikan ke pekerja</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setCompletingReg(null)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "12px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button
                onClick={handleActivate}
                disabled={!completeJabatan || !completeRate}
                style={{ background: !completeJabatan || !completeRate ? "var(--kas-line)" : "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "12px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: !completeJabatan || !completeRate ? "not-allowed" : "pointer" }}
              >
                Aktifkan Akun
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
