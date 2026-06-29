"use client";
import { useEffect, useRef, useState } from "react";
import { type PendingRegistration } from "@/lib/data";
import { usePendingRegistrations } from "@/lib/stores";
import { WORKER_JABATAN } from "@/components/login/types";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";
import { BossConfirmDialog } from "@/components/admin/boss-confirm";

export default function AMApprovals({ onBack, toast }: { onBack: () => void; toast: (m: string) => void }) {
  const PENDING_REGISTRATIONS = usePendingRegistrations();
  const [regs, setRegs] = useState<PendingRegistration[]>(
    PENDING_REGISTRATIONS.filter((r) => r.status === "Pending" && WORKER_JABATAN.includes(r.jabatan))
  );
  // Seed local editable list from live registrations once they hydrate.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && PENDING_REGISTRATIONS.length > 0) {
      setRegs(PENDING_REGISTRATIONS.filter((r) => r.status === "Pending" && WORKER_JABATAN.includes(r.jabatan)));
      seeded.current = true;
    }
  }, [PENDING_REGISTRATIONS]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);

  const doApprove = (id: string, name: string) => {
    setRegs((prev) => prev.filter((r) => r.id !== id));
    toast(`Akun ${name} disetujui.`);
  };
  const doReject = (id: string, name: string) => {
    setRegs((prev) => prev.filter((r) => r.id !== id));
    toast(`Pendaftaran ${name} ditolak.`);
  };

  const pendingReg = regs.find((r) => r.id === confirmId);
  const rejectReg  = regs.find((r) => r.id === rejectConfirmId);

  return (
    <>
      {confirmId && pendingReg && (
        <BossConfirmDialog
          onConfirm={() => { doApprove(confirmId, pendingReg.name); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {rejectConfirmId && rejectReg && (
        <BossConfirmDialog
          message="Apakah bos sudah menyetujui penolakan pendaftaran ini?"
          onConfirm={() => { doReject(rejectConfirmId, rejectReg.name); setRejectConfirmId(null); }}
          onCancel={() => setRejectConfirmId(null)}
        />
      )}
    <div className="px-5 pt-4 pb-6">
      <button
        type="button"
        onClick={onBack}
        style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: 0, marginBottom: 16 }}
      >
        ← Kembali
      </button>

      <Kicker no="B" label="PENDAFTARAN PEKERJA" />
      <DisplayHeading size={28}>Persetujuan,<br /><em>anggota baru.</em></DisplayHeading>

      <div className="mt-5">
        {regs.length === 0 ? (
          <div className="py-8 flex flex-col items-center" style={{ border: "1px dashed var(--kas-line)", background: "var(--kas-paper-2)" }}>
            <MonoLabel size={9}>Tidak ada pendaftaran baru</MonoLabel>
          </div>
        ) : (
          <div className="flex flex-col" style={{ borderTop: "1px solid var(--kas-line)" }}>
            {regs.map((r) => (
              <div key={r.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid place-items-center" style={{ width: 40, height: 40, background: "var(--kas-ochre-soft)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, color: "var(--kas-ochre-ink)" }}>
                    {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>
                      {r.jabatan} · {r.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </div>
                  </div>
                  <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", background: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)", border: "1px solid var(--kas-line)", flexShrink: 0 }}>
                    Menunggu
                  </span>
                </div>

                <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: "80px 1fr" }}>
                  <MonoLabel size={9}>Nomor HP</MonoLabel>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{r.phone}</span>
                  <MonoLabel size={9}>Tanggal</MonoLabel>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{r.submittedAt}</span>
                </div>

                <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <button
                    type="button"
                    onClick={() => setConfirmId(r.id)}
                    style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectConfirmId(r.id)}
                    style={{ border: "1px solid var(--kas-rust)", background: "transparent", color: "var(--kas-rust)", padding: "10px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
