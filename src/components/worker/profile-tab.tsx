"use client";
import { useState } from "react";
import { ACCOUNTS, TODAY_SHORT, type Worker } from "@/lib/data";
import { useWorkers } from "@/lib/stores";
import { useProjects } from "@/lib/projects-store";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";
import HistoryTab from "@/components/worker/history-tab";
import { EditProfileOverlay } from "@/components/profile/edit-profile";

type View = "profile" | "kontak-tim" | "riwayat";

function WAButton({ phone }: { phone: string }) {
  const digits = phone.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      className="grid place-items-center flex-shrink-0"
      style={{ width: 32, height: 32, background: "var(--kas-ink)", color: "var(--kas-paper)", textDecoration: "none" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.52 3.48A11.95 11.95 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.18 1.6 6L0 24l6.2-1.6A11.96 11.96 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zM12 21.9a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.68.96.99-3.58-.24-.37A9.87 9.87 0 012.1 12C2.1 6.52 6.52 2.1 12 2.1c2.65 0 5.14 1.03 7.01 2.9A9.86 9.86 0 0121.9 12c0 5.48-4.42 9.9-9.9 9.9zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.47.71.31 1.26.49 1.69.62.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileTab({
  me,
  onLogout,
}: {
  me: Worker;
  onLogout: () => void;
}) {
  const WORKERS = useWorkers();
  const PROJECTS = useProjects();
  const [view, setView] = useState<View>("profile");
  const [showEdit, setShowEdit] = useState(false);
  const [profile, setProfile] = useState({ name: me.name, phone: me.phone });

  const adminAccount = ACCOUNTS.find((a) => a.role === "admin");
  const adminPhone = adminAccount?.phone ?? "";
  const ownerAccount = ACCOUNTS.find((a) => a.role === "owner");
  const ownerPhone = ownerAccount?.phone ?? "";

  if (view === "kontak-tim") {
    const myProjects = PROJECTS.filter((p) => p.assigned.includes(me.id));
    const teamWorkerIds = new Set(myProjects.flatMap((p) => p.assigned));
    teamWorkerIds.delete(me.id);
    const teamWorkers = WORKERS.filter((w) => teamWorkerIds.has(w.id));

    return (
      <div className="flex flex-col h-full">
        <button
          type="button"
          onClick={() => setView("profile")}
          className="flex items-center gap-2 px-5 py-3.5 text-left"
          style={{ border: "none", borderBottom: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer" }}
        >
          ← Kembali ke Profil
        </button>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <Kicker no="02" label="KONTAK TIM" />
          <DisplayHeading size={24}>
            Tim,<br /><em>proyek kamu.</em>
          </DisplayHeading>

          <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {teamWorkers.length === 0 ? (
              <div className="py-6 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Belum ada rekan tim
              </div>
            ) : (
              teamWorkers.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center gap-3"
                  style={{ paddingTop: 14, paddingBottom: 14, borderBottom: "1px solid var(--kas-line)" }}
                >
                  <div
                    className="grid place-items-center flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--kas-paper-2)",
                      border: "1px solid var(--kas-line)",
                      fontFamily: "var(--font-newsreader), serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--kas-ink)",
                    }}
                  >
                    {getInitials(w.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{w.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>
                      {w.role}{w.isKepalaProyek ? " · Kepala Proyek" : ""}
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-2)", marginTop: 2 }}>
                      {w.phone}
                    </div>
                  </div>
                  <WAButton phone={w.phone} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "riwayat") {
    return (
      <div className="flex flex-col h-full">
        <button
          type="button"
          onClick={() => setView("profile")}
          className="flex items-center gap-2 px-5 py-3.5 text-left"
          style={{ border: "none", borderBottom: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer" }}
        >
          ← Kembali ke Profil
        </button>
        <div className="flex-1 overflow-y-auto">
          <HistoryTab />
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="AKUN ANDA" />
      <DisplayHeading size={28}>
        Profil,<br /><em>{profile.name.split(" ").slice(-1)[0]}.</em>
      </DisplayHeading>

      <div className="mt-4 flex items-center gap-3.5 px-4 py-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <div
          className="grid place-items-center"
          style={{ width: 52, height: 52, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500 }}
        >
          {me.short}
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1.1 }}>{profile.name}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{me.role}</div>
        </div>
      </div>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-line)" }}>
        {[
          { l: "Nomor HP", v: profile.phone },
          { l: "Peran",    v: me.isKepalaProyek ? `${me.role} · Kepala Proyek` : me.role },
        ].map((r, i) => (
          <div key={i} className="grid gap-3 py-3" style={{ gridTemplateColumns: "110px 1fr", borderBottom: "1px solid var(--kas-line-2)" }}>
            <MonoLabel size={10}>{r.l}</MonoLabel>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{r.v}</span>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShowEdit(true)}
          className="w-full flex items-center justify-between py-3"
          style={{ border: "none", borderBottom: "1px solid var(--kas-line-2)", background: "transparent", cursor: "pointer", textAlign: "left" }}
        >
          <MonoLabel size={10}>Edit Profil</MonoLabel>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>→</span>
        </button>

        {me.isKepalaProyek && (
          <button
            type="button"
            onClick={() => setView("kontak-tim")}
            className="w-full flex items-center justify-between py-3"
            style={{ border: "none", borderBottom: "1px solid var(--kas-line-2)", background: "transparent", cursor: "pointer", textAlign: "left" }}
          >
            <MonoLabel size={10}>Kontak Tim</MonoLabel>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>→</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setView("riwayat")}
          className="w-full flex items-center justify-between py-3"
          style={{ border: "none", borderBottom: "1px solid var(--kas-line-2)", background: "transparent", cursor: "pointer", textAlign: "left" }}
        >
          <MonoLabel size={10}>Riwayat Kehadiran</MonoLabel>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>→</span>
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {ownerPhone && (
          <a
            href={`tel:${ownerPhone}`}
            className="w-full py-3.5 grid place-items-center"
            style={{ border: "1px solid var(--kas-ink)", background: "transparent", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Hubungi Owner
          </a>
        )}
        {adminPhone && (
          <a
            href={`tel:${adminPhone}`}
            className="w-full py-3.5 grid place-items-center"
            style={{ border: "1px solid var(--kas-ink)", background: "transparent", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Hubungi Kantor
          </a>
        )}
        <button
          onClick={onLogout}
          className="w-full py-3.5"
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Keluar
        </button>
      </div>

      <div className="mt-5 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Tauke v0.1 · {TODAY_SHORT}
      </div>

      {showEdit && (
        <EditProfileOverlay
          name={profile.name}
          phone={profile.phone}
          role={me.isKepalaProyek ? `${me.role} · Kepala Proyek` : me.role}
          onCancel={() => setShowEdit(false)}
          onSave={({ name, phone }) => { setProfile({ name, phone }); setShowEdit(false); }}
        />
      )}
    </div>
  );
}
