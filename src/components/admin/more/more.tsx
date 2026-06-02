"use client";
import { useState } from "react";
import { WORKERS, PROJECTS, PENDING_REGISTRATIONS } from "@/lib/data";
import { WORKER_JABATAN } from "@/components/login/types";
import { Kicker, DisplayHeading } from "@/components/primitives";
import { EditProfileOverlay } from "@/components/profile/edit-profile";
import AMWorkerManagement from "./worker-management";
import AMApprovals from "./approvals";
import AMContacts from "./contacts";
import { RiwayatTab } from "@/components/admin/financial/riwayat-tab";
import { MaterialTab } from "@/components/admin/financial/material-tab";

const activeClientsCount  = PROJECTS.filter((p) => p.status === "Active").length;
const workerPendingCount  = PENDING_REGISTRATIONS.filter(
  (r) => r.status === "Pending" && WORKER_JABATAN.includes(r.jabatan)
).length;

type SubView = "workers" | "approvals" | "contacts" | "riwayat" | "material";

function MenuItem({ n, label, sub, onClick }: { n: string; label: string; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5"
      style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", cursor: "pointer" }}
    >
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{n}</span>
        <div className="text-left">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{label}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{sub}</div>
        </div>
      </div>
      <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-ink-3)" }}>→</span>
    </button>
  );
}

export default function AMMore({ session, toast, onLogout }: { session: { name: string; short: string; phone?: string }; toast: (m: string) => void; onLogout: () => void }) {
  const [subView, setSubView] = useState<SubView | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [profile, setProfile] = useState({ name: session.name, phone: session.phone ?? "" });
  const back = () => setSubView(null);

  if (subView === "workers")   return <AMWorkerManagement onBack={back} toast={toast} />;
  if (subView === "approvals") return <AMApprovals onBack={back} toast={toast} />;
  if (subView === "contacts")  return <AMContacts onBack={back} />;
  if (subView === "riwayat")   return (
    <div className="px-5 pt-4 pb-6">
      <button onClick={back} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 12px" }}>← Kembali</button>
      <RiwayatTab />
    </div>
  );
  if (subView === "material")  return (
    <div className="px-5 pt-4 pb-6">
      <button onClick={back} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 12px" }}>← Kembali</button>
      <MaterialTab />
    </div>
  );

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="05" label="AKUN & PENGATURAN" />
      <DisplayHeading size={28}>Lainnya,<br /><em>{profile.name.split(" ").slice(-1)[0]}.</em></DisplayHeading>

      {/* ── Profile card ──────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-3.5 px-4 py-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <div className="grid place-items-center" style={{ width: 48, height: 48, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 20, fontWeight: 500 }}>
          {session.short}
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 19, lineHeight: 1.1 }}>{profile.name}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            ADMINISTRASI · STAF KANTOR
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowEdit(true)}
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", color: "var(--kas-ink)", padding: "7px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}
        >
          Edit
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {/* A · Tim */}
        <div>
          <Kicker no="A" label="MANAJEMEN TIM" />
          <MenuItem n="01" label="Manajemen Pekerja" sub={`${WORKERS.length} pekerja terdaftar`} onClick={() => setSubView("workers")} />
        </div>

        {/* B · Pendaftaran */}
        <div>
          <Kicker no="B" label="PENDAFTARAN PEKERJA" />
          <MenuItem
            n="02"
            label="Persetujuan Pekerja"
            sub={workerPendingCount > 0 ? `${workerPendingCount} menunggu persetujuan` : "Tidak ada yang menunggu"}
            onClick={() => setSubView("approvals")}
          />
        </div>

        {/* C · Direktori */}
        <div>
          <Kicker no="C" label="DIREKTORI" />
          <MenuItem n="03" label="Direktori Kontak" sub={`Pekerja & ${activeClientsCount} klien aktif`} onClick={() => setSubView("contacts")} />
        </div>

        {/* D · Keuangan */}
        <div>
          <Kicker no="D" label="KEUANGAN" />
          <div className="flex flex-col gap-2">
            <MenuItem n="04" label="Riwayat Keuangan" sub="Arus kas & transaksi" onClick={() => setSubView("riwayat")} />
            <MenuItem n="05" label="Manajemen Material" sub="Stok & inventaris" onClick={() => setSubView("material")} />
          </div>
        </div>
      </div>

      {/* ── Logout ────────────────────────────────────────────────────────── */}
      <div className="mt-6">
        <button
          onClick={onLogout}
          className="w-full py-3.5"
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Keluar
        </button>
      </div>

      {showEdit && (
        <EditProfileOverlay
          name={profile.name}
          phone={profile.phone}
          role="Administrasi · Staf Kantor"
          onCancel={() => setShowEdit(false)}
          onSave={({ name, phone }) => { setProfile({ name, phone }); setShowEdit(false); toast("Profil diperbarui."); }}
        />
      )}
    </div>
  );
}
