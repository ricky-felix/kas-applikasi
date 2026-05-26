"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, MATERIALS, BILLING, WORK_REPORTS, MATERIAL_REQUESTS, CHANGE_ORDERS, fmtIDR, fmtIDRshort } from "@/lib/data";
import { MonoLabel, StatusPill, ProgressBar } from "../ui";
import { TopBar, SectionHead, Footer, WAIcon } from "./shared";

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ p }: { p: typeof PROJECTS[0] }) {
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

// ─── Team Tab ─────────────────────────────────────────────────────────────────
function TeamTab({ p }: { p: typeof PROJECTS[0] }) {
  const assigned = WORKERS.filter((w) => p.assigned.includes(w.id));
  const statuses = ["Hadir","Hadir","Setengah Hari","Tidak Hadir","Hadir","Hadir"];
  const [payingWorkerId, setPayingWorkerId] = useState<string | null>(null);
  const [paidSet, setPaidSet] = useState<Set<string>>(new Set());

  const payingWorker = payingWorkerId ? WORKERS.find((w) => w.id === payingWorkerId) : null;
  const payingWorkerIdx = payingWorkerId ? assigned.findIndex((w) => w.id === payingWorkerId) : -1;
  const payingDays = payingWorkerIdx >= 0 ? ([10, 12, 8][payingWorkerIdx] || 9) : 0;
  const payingOwed = payingWorker ? payingDays * payingWorker.rate : 0;

  return (
    <div>
      <SectionHead no="01" kicker={`${assigned.length} ORANG DITUGASKAN`}>Tim, <em>hari ini.</em></SectionHead>
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0" }}>Pekerja</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Peran</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Status</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Tarif/Hari</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Hadir</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Upah Tersisa</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {assigned.map((w, i) => {
            const days = [10, 12, 8][i] || 9;
            const owed = days * w.rate;
            const status = statuses[i] || "Hadir";
            const isPaid = paidSet.has(w.id);
            return (
              <tr key={w.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "16px 14px 16px 0" }}>
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500 }}>{w.short}</div>
                    <div>
                      <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 2 }}>{w.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 14px", color: "var(--kas-ink-2)" }}>{w.role}</td>
                <td style={{ padding: "16px 14px" }}>
                  <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: status === "Hadir" ? "var(--kas-cobalt-soft)" : status === "Setengah Hari" ? "var(--kas-ochre-soft)" : "var(--kas-paper-2)", color: status === "Hadir" ? "var(--kas-cobalt-ink)" : status === "Setengah Hari" ? "var(--kas-ochre-ink)" : "var(--kas-ink-3)" }}>{status}</span>
                </td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{fmtIDR(w.rate)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{days}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)" }}>{fmtIDR(owed)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right" }}>
                  {isPaid ? (
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-moss)", fontWeight: 600 }}>✓ LUNAS</span>
                  ) : (
                    <button onClick={() => setPayingWorkerId(w.id)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Bayar</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {payingWorkerId && payingWorker && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={() => setPayingWorkerId(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>KONFIRMASI BAYAR</span>
              <button onClick={() => setPayingWorkerId(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 16px" }}>{payingWorker.name}. <em>Upah.</em></h2>
            <div className="py-4 px-0" style={{ borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)", marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Total Upah</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, fontWeight: 500, color: "var(--kas-rust)" }}>{fmtIDR(payingOwed)}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4 }}>{payingDays} hari · {fmtIDR(payingWorker.rate)}/hari</div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setPayingWorkerId(null)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button onClick={() => { setPaidSet((s) => { const n = new Set(s); n.add(payingWorkerId); return n; }); setPayingWorkerId(null); }} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Konfirmasi Bayar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Material Tab ─────────────────────────────────────────────────────────────
function MaterialTab() {
  return (
    <div>
      <SectionHead no="01" kicker="DIPAKAI VS DIANGGARKAN">Material, <em>terpakai.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {MATERIALS.map((m, i) => {
          const pct = Math.round((m.used / m.budget) * 100);
          const low = pct >= 90;
          return (
            <div key={m.id} className="grid gap-5 items-center py-4" style={{ gridTemplateColumns: "auto 1fr 1.4fr auto", borderBottom: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{m.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{m.supplier}</div>
              </div>
              <div>
                <div className="flex justify-between mb-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                  <span>{m.used} / {m.budget} {m.unit}</span>
                  <span style={{ color: low ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} />
              </div>
              <span className="px-2 py-1 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: low ? "var(--kas-rust-soft)" : "var(--kas-paper-2)", color: low ? "var(--kas-rust-ink)" : "var(--kas-ink-3)", border: "1px solid var(--kas-line)", minWidth: 90 }}>{low ? "Stok Tipis" : "Aman"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Billing Tab ─────────────────────────────────────────────────────────────
function BillingTabComp({ p }: { p: typeof PROJECTS[0] }) {
  const paid = BILLING.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const pending = BILLING.filter((b) => b.status !== "Paid").reduce((s, b) => s + b.amount, 0);
  const [paidSet, setPaidSet] = useState<Set<number>>(new Set());

  const effectivePaid = (b: typeof BILLING[0], i: number) => b.status === "Paid" || paidSet.has(i);

  return (
    <div>
      <div className="grid mb-7" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[{ l: "Total Kontrak", v: fmtIDR(p.contractValue), accent: false }, { l: "Sudah Dibayar", v: fmtIDR(paid), accent: false }, { l: "Sisa Tagihan", v: fmtIDR(pending), accent: true }].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 8, color: s.accent ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.v}</div>
          </div>
        ))}
      </div>
      <SectionHead no="01" kicker="EMPAT TAHAP">Pembayaran, <em>berkelanjutan.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {BILLING.map((b, i) => {
          const isEffectivePaid = effectivePaid(b, i);
          const sisa = p.contractValue - p.paid;
          const waMsg = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nTagihan tahap *${b.stage}* proyek *${p.name}* senilai *${fmtIDR(b.amount)}* belum dilunasi.\n\nMohon konfirmasi pembayaran.\n\n— CV Karya Agung Sejati`);
          const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;
          return (
            <div key={i} className="grid gap-6 items-center py-5" style={{ gridTemplateColumns: "48px 1fr auto auto auto", borderBottom: "1px solid var(--kas-line)" }}>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontStyle: "italic", color: isEffectivePaid ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>{["I","II","III","IV"][i]}</span>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20 }}>{b.stage}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{b.date ? `Dibayar ${b.date}` : "Belum dibayar"}</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 16, color: isEffectivePaid ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>{fmtIDR(b.amount)}</div>
              <span className="px-2.5 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: isEffectivePaid ? "var(--kas-moss-soft)" : "var(--kas-ochre-soft)", color: isEffectivePaid ? "var(--kas-moss-ink)" : "var(--kas-ochre-ink)" }}>{isEffectivePaid ? "Lunas" : "Pending"}</span>
              <div className="flex gap-2">
                {!isEffectivePaid && (
                  <>
                    <button onClick={() => setPaidSet((s) => { const n = new Set(s); n.add(i); return n; })} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tandai Lunas</button>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5" style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", color: "var(--kas-ink)" }}>
                      <WAIcon />Tagih
                    </a>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Photos Tab ───────────────────────────────────────────────────────────────
function PhotosTab() {
  const photos = [{ phase: "Sebelum", n: 12 }, { phase: "Pengerjaan", n: 28 }, { phase: "Sesudah", n: 7 }];
  return (
    <div>
      <SectionHead no="01" kicker="LOG VISUAL">Foto, <em>tiga fase.</em></SectionHead>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {photos.map((g, i) => (
          <div key={i}>
            <div className="relative grid place-items-center" style={{ aspectRatio: "4/3", background: "repeating-linear-gradient(45deg, var(--kas-paper-2) 0 12px, var(--kas-line-2) 12px 13px)", border: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{g.n} foto</MonoLabel>
              <div className="absolute top-2 left-2" style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontStyle: "italic", background: "var(--kas-paper)", padding: "2px 8px" }}>{["I","II","III"][i]}</div>
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, marginTop: 10 }}>{g.phase}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Work Reports Tab ─────────────────────────────────────────────────────────
function WorkReportsTab({ projectId }: { projectId: string }) {
  const reports = WORK_REPORTS.filter((r) => r.projectId === projectId);
  const requests = MATERIAL_REQUESTS.filter((r) => r.projectId === projectId);
  const [reqStatuses, setReqStatuses] = useState<Record<string, "Pending" | "Disetujui" | "Ditolak">>(() =>
    Object.fromEntries(MATERIAL_REQUESTS.map((r) => [r.id, r.status as "Pending" | "Disetujui" | "Ditolak"]))
  );

  const pendingReqs = requests.filter((r) => reqStatuses[r.id] === "Pending").length;

  return (
    <div className="grid gap-9" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
      <div>
        <SectionHead no="01" kicker={`${reports.length} LAPORAN`}>Catatan harian, <em>lapangan.</em></SectionHead>
        <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {reports.map((r) => (
            <div key={r.id} className="grid gap-4 items-start py-4" style={{ gridTemplateColumns: "40px 1fr", borderBottom: "1px solid var(--kas-line)" }}>
              <div className="grid place-items-center" style={{ width: 36, height: 36, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontWeight: 500 }}>{r.workerShort}</div>
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{r.workerName}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{r.date}</span>
                </div>
                <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.5, color: "var(--kas-ink-2)", margin: 0 }}>{r.note}</p>
                {r.photos > 0 && <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-cobalt)", marginTop: 6, letterSpacing: "0.14em", textTransform: "uppercase" }}>{r.photos} foto terlampir</div>}
              </div>
            </div>
          ))}
          {reports.length === 0 && <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Belum ada laporan.</div>}
        </div>
      </div>
      <div>
        <SectionHead no="02" kicker={`${pendingReqs} PENDING`}>Permintaan <em>material.</em></SectionHead>
        <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {requests.map((req) => {
            const status = reqStatuses[req.id];
            return (
              <div key={req.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <div className="flex justify-between items-baseline mb-1">
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{req.materialName}</span>
                  <span style={{ padding: "2px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", background: status === "Pending" ? "var(--kas-ochre-soft)" : status === "Disetujui" ? "var(--kas-moss-soft)" : "var(--kas-paper-2)", color: status === "Pending" ? "var(--kas-ochre-ink)" : status === "Disetujui" ? "var(--kas-moss-ink)" : "var(--kas-ink-3)" }}>{status}</span>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>{req.qty} {req.unit} · {req.workerName} · {req.date}</div>
                {req.note && <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-2)", marginTop: 4, fontStyle: "italic" }}>{req.note}</div>}
                {status === "Pending" && (
                  <div className="flex gap-1.5 mt-2.5">
                    <button onClick={() => setReqStatuses((p) => ({ ...p, [req.id]: "Disetujui" }))} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                    <button onClick={() => setReqStatuses((p) => ({ ...p, [req.id]: "Ditolak" }))} style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Tolak</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Change Orders Tab ────────────────────────────────────────────────────────
function ChangeOrdersTab({ projectId }: { projectId: string }) {
  const orders = CHANGE_ORDERS.filter((c) => c.projectId === projectId);
  const [coStatuses, setCoStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(CHANGE_ORDERS.map((c) => [c.id, c.status]))
  );

  const approved = orders.filter((c) => coStatuses[c.id] === "Disetujui").reduce((s, c) => s + c.costImpact, 0);
  const pending = orders.filter((c) => coStatuses[c.id] === "Menunggu").reduce((s, c) => s + c.costImpact, 0);

  return (
    <div>
      <div className="grid mb-7" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[
          { l: "Total Change Order", v: String(orders.length).padStart(2, "0"), accent: false },
          { l: "Nilai Disetujui",    v: fmtIDR(approved),  accent: false },
          { l: "Menunggu Persetujuan", v: fmtIDR(pending), accent: pending > 0 },
        ].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 8, color: s.accent ? "var(--kas-ochre)" : "var(--kas-ink)" }}>{s.v}</div>
          </div>
        ))}
      </div>
      <SectionHead no="01" kicker={`${orders.length} PERUBAHAN`}>Change order, <em>tercatat.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {orders.map((co, i) => {
          const status = coStatuses[co.id];
          return (
            <div key={co.id} className="grid gap-5 items-start py-5" style={{ gridTemplateColumns: "40px 1fr auto auto auto", borderBottom: "1px solid var(--kas-line)" }}>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 24, color: "var(--kas-ink-3)" }}>{["I","II","III"][i]}</span>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.3, marginBottom: 4 }}>{co.description}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{co.date} · {co.requestedBy}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: status === "Ditolak" ? "var(--kas-ink-3)" : co.costImpact > 0 ? "var(--kas-rust)" : "var(--kas-ink)", textDecoration: status === "Ditolak" ? "line-through" : "none" }}>+{fmtIDR(co.costImpact)}</div>
              </div>
              <span style={{ padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", background: status === "Disetujui" ? "var(--kas-moss-soft)" : status === "Menunggu" ? "var(--kas-ochre-soft)" : "var(--kas-paper-2)", color: status === "Disetujui" ? "var(--kas-moss-ink)" : status === "Menunggu" ? "var(--kas-ochre-ink)" : "var(--kas-ink-3)", whiteSpace: "nowrap" }}>
                {status}
              </span>
              <div className="flex gap-1.5">
                {status === "Menunggu" && (
                  <>
                    <button onClick={() => setCoStatuses((p) => ({ ...p, [co.id]: "Disetujui" }))} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "6px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                    <button onClick={() => setCoStatuses((p) => ({ ...p, [co.id]: "Ditolak" }))} style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "6px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Tolak</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Tidak ada change order.</div>}
      </div>
    </div>
  );
}

// ─── Project Detail ───────────────────────────────────────────────────────────
export default function ProjectDetail({ id, back }: { id: string; back: () => void }) {
  const p = PROJECTS.find((x) => x.id === id) || PROJECTS[0];
  const [tab, setTab] = useState("overview");
  const sisa = p.contractValue - p.paid;

  const tabs = [
    { k: "overview", n: "I",    label: "Ringkasan" },
    { k: "team",     n: "II",   label: "Tim & Absensi" },
    { k: "material", n: "III",  label: "Material" },
    { k: "billing",  n: "IV",   label: "Tagihan" },
    { k: "photos",   n: "V",    label: "Foto" },
    { k: "reports",  n: "VI",   label: "Laporan Harian" },
    { k: "changes",  n: "VII",  label: "Change Order" },
  ];

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar crumb={
        <>
          <button onClick={back} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>← Proyek</button>
          <span style={{ color: "var(--kas-ink-3)", margin: "0 8px" }}>/</span>
          <MonoLabel size={10}>{p.code}</MonoLabel>
        </>
      } />

      <div className="grid gap-9 py-6" style={{ gridTemplateColumns: "1.6fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        <div>
          <div className="flex items-center gap-2.5 mb-2.5"><StatusPill status={p.status} /><MonoLabel size={10}>{p.category.toUpperCase()}</MonoLabel></div>
          <h1 style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 48, lineHeight: 1.0, letterSpacing: "-0.02em", margin: "8px 0 0" }}>
            {p.name.split(" ").slice(0, -1).join(" ")} <em>{p.name.split(" ").slice(-1)[0]}.</em>
          </h1>
          <div className="flex gap-7 mt-5" style={{ color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, letterSpacing: "0.1em" }}>
            {[{ l: "Klien", v: p.client.name }, { l: "Mulai", v: p.start }, { l: "Est. Selesai", v: p.endEst }, { l: "Lokasi", v: p.address }].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" }}>{f.l}</div>
                <div style={{ color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, marginTop: 4 }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid" style={{ gridTemplateRows: "1fr 1fr" }}>
          <div className="pb-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <MonoLabel size={10}>Progres</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 40, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em" }}>{p.progress}%</div>
            <ProgressBar pct={p.progress} height={6} />
          </div>
          <div className="pt-4 grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[{ l: "Nilai Kontrak", v: fmtIDRshort(p.contractValue), accent: false }, { l: "Sisa Tagihan", v: sisa > 0 ? fmtIDRshort(sisa) : "Lunas", accent: sisa > 0 }].map((s, i) => (
              <div key={i}>
                <MonoLabel size={10}>{s.l}</MonoLabel>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 24, marginTop: 6, color: s.accent ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex mt-6" style={{ borderBottom: "1px solid var(--kas-ink)" }}>
        {tabs.map((t, i) => (
          <button key={t.k} onClick={() => setTab(t.k)} className="flex items-center gap-2.5 cursor-pointer" style={{ border: "none", borderRight: i < tabs.length - 1 ? "1px solid var(--kas-line)" : "none", background: tab === t.k ? "var(--kas-ink)" : "transparent", color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)", padding: "12px 18px" }}>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 12, fontStyle: "italic", opacity: 0.6 }}>{t.n}</span>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="py-7">
        {tab === "overview" && <OverviewTab p={p} />}
        {tab === "team" && <TeamTab p={p} />}
        {tab === "material" && <MaterialTab />}
        {tab === "billing" && <BillingTabComp p={p} />}
        {tab === "photos" && <PhotosTab />}
        {tab === "reports" && <WorkReportsTab projectId={p.id} />}
        {tab === "changes" && <ChangeOrdersTab projectId={p.id} />}
      </div>
      <Footer />
    </div>
  );
}
