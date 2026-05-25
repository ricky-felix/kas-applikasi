"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, TODAY_SHORT, fmtIDRshort, fmtIDR } from "@/lib/data";
import { Account } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel, Toast, MobileTopBar } from "./ui";

type TabKey = "home" | "projects" | "attend" | "billing" | "more";

export default function AdminMobile({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const [tab, setTab] = useState<TabKey>("home");
  const [snack, setSnack] = useState<string | null>(null);
  const toast = (m: string) => { setSnack(m); setTimeout(() => setSnack(null), 2400); };

  const sess = session || { name: "Bu Sari", short: "SR" };

  const TABS = [
    { k: "home",     n: "01", l: "Beranda", icon: "⌂" },
    { k: "projects", n: "02", l: "Proyek",  icon: "▭" },
    { k: "attend",   n: "03", l: "Absensi", icon: "✓" },
    { k: "billing",  n: "04", l: "Tagihan", icon: "$" },
    { k: "more",     n: "05", l: "Lainnya", icon: "≡" },
  ] as const;

  const tabLabels: Record<TabKey, string> = { home: "01 · BERANDA", projects: "02 · PROYEK", attend: "03 · ABSENSI", billing: "04 · TAGIHAN", more: "05 · LAINNYA" };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif" }}>
      <MobileTopBar tabLabel={tabLabels[tab]} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tab === "home"     && <AMHome />}
        {tab === "projects" && <AMProjects toast={toast} />}
        {tab === "attend"   && <AMAttend toast={toast} />}
        {tab === "billing"  && <AMBilling toast={toast} />}
        {tab === "more"     && <AMMore session={sess} toast={toast} onLogout={onLogout} />}
      </div>

      <nav className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", borderTop: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
        {TABS.map((t, i) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as TabKey)}
            className="flex flex-col items-center gap-0.5 py-2.5 pb-3 cursor-pointer"
            style={{
              border: "none",
              borderRight: i < 4 ? "1px solid var(--kas-line)" : "none",
              background: tab === t.k ? "var(--kas-ink)" : "transparent",
              color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)",
            }}
          >
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase" }}>{t.l}</span>
          </button>
        ))}
      </nav>

      {snack && <Toast message={snack} />}
    </div>
  );
}

function AMHome() {
  const active = PROJECTS.filter((p) => p.status === "Active");
  const outstanding = PROJECTS.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const workersToday = WORKERS.filter((w) => active.some((p) => p.assigned.includes(w.id))).length;

  const stats = [
    { n: "01", l: "Proyek aktif",       v: String(active.length).padStart(2, "0"), accent: false },
    { n: "02", l: "Belum dibayar",      v: fmtIDRshort(outstanding), accent: true },
    { n: "03", l: "Pekerja hadir",      v: String(workersToday).padStart(2, "0"), accent: false },
    { n: "04", l: "Aktivitas hari ini", v: "07", accent: false },
  ];

  const activity = [
    { t: "08:15", who: "Pak Suparman", a: "Hadir · Cemara Asri" },
    { t: "08:14", who: "Budi Hartono", a: "Hadir · Cemara Asri" },
    { t: "08:20", who: "Dedi Saragih", a: "Hadir · Cambridge" },
    { t: "07:51", who: "Eko Prasetyo", a: "Setengah hari · Cemara Asri" },
  ];

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="00" label={TODAY_SHORT} />
      <DisplayHeading size={28}>Empat angka,<br /><em>satu pagi.</em></DisplayHeading>

      <div className="mt-4 flex flex-col">
        {stats.map((c, i) => (
          <div
            key={i}
            className="grid items-center gap-3.5"
            style={{
              gridTemplateColumns: "auto 1fr auto",
              borderTop: i === 0 ? "1px solid var(--kas-ink)" : "none",
              borderBottom: i === stats.length - 1 ? "1px solid var(--kas-ink)" : "1px solid var(--kas-line)",
              padding: "16px 0",
            }}
          >
            <MonoLabel size={10}>{c.n}</MonoLabel>
            <div>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.l}</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 32, lineHeight: 1.0, marginTop: 4, color: c.accent ? "var(--kas-orange)" : "var(--kas-ink)", letterSpacing: "-0.02em" }}>{c.v}</div>
            </div>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-ink-3)" }}>→</span>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Kicker no="—" label="AKTIVITAS LAPANGAN" />
        {activity.map((it, i) => (
          <div key={i} className="grid gap-3 items-baseline py-2.5" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line-2)" }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", minWidth: 38 }}>{it.t}</span>
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{it.who}</span>
              <div style={{ color: "var(--kas-ink-3)", fontSize: 11, marginTop: 2 }}>{it.a}</div>
            </div>
            <span className="inline-block" style={{ width: 5, height: 5, background: "var(--kas-orange)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AMProjects({ toast }: { toast: (m: string) => void }) {
  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label={`${PROJECTS.length} TOTAL`} />
      <div className="flex justify-between items-baseline">
        <DisplayHeading size={28}>Proyek,<br /><em>semua.</em></DisplayHeading>
        <button onClick={() => toast("Form proyek baru.")} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 14px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>+ Baru</button>
      </div>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {PROJECTS.map((p) => {
          const sisa = p.contractValue - p.paid;
          const statusLabel = { Active: "Aktif", "On Hold": "Ditahan", Completed: "Selesai", Draft: "Draf" }[p.status];
          const statusBg = p.status === "Active" ? "var(--kas-orange-soft)" : p.status === "Completed" ? "var(--kas-green-soft)" : "var(--kas-paper-2)";
          return (
            <div key={p.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-baseline">
                <MonoLabel size={10}>{p.code}</MonoLabel>
                <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", background: statusBg, color: p.status === "On Hold" ? "var(--kas-amber)" : "var(--kas-ink)", border: "1px solid var(--kas-line)" }}>{statusLabel}</span>
              </div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.2, marginTop: 6 }}>{p.name}</div>
              <div className="flex justify-between items-center mt-2.5">
                <MonoLabel size={10}>{p.client.name}</MonoLabel>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: sisa > 0 ? "var(--kas-orange)" : "var(--kas-ink-3)" }}>{sisa > 0 ? fmtIDRshort(sisa) : "Lunas"}</span>
              </div>
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="flex-1 relative" style={{ height: 4, background: "var(--kas-line-2)" }}>
                  <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
                </div>
                <MonoLabel size={10}>{p.progress}%</MonoLabel>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AMAttend({ toast }: { toast: (m: string) => void }) {
  const active = PROJECTS.filter((p) => p.status === "Active");
  const [proj, setProj] = useState(active[0]?.id);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const setMark = (wid: string, s: string) => { setMarks({ ...marks, [wid]: s }); toast(`${s} tercatat.`); };
  const p = PROJECTS.find((x) => x.id === proj);
  const ws = WORKERS.filter((w) => p?.assigned.includes(w.id));

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="LOG HARIAN" />
      <DisplayHeading size={28}>Absensi,<br /><em>{TODAY_SHORT.toLowerCase()}.</em></DisplayHeading>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-line)" }}>
        <div className="flex gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
          {active.map((x) => (
            <button
              key={x.id}
              onClick={() => setProj(x.id)}
              className="px-3 py-2 whitespace-nowrap cursor-pointer"
              style={{
                border: "1px solid var(--kas-ink)",
                background: proj === x.id ? "var(--kas-ink)" : "var(--kas-paper)",
                color: proj === x.id ? "var(--kas-paper)" : "var(--kas-ink)",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {x.address}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        {ws.map((w) => {
          const mark = marks[w.id];
          return (
            <div key={w.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex items-center gap-3">
                <div className="grid place-items-center" style={{ width: 36, height: 36, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontWeight: 500 }}>{w.short}</div>
                <div className="flex-1">
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{w.role}</div>
                </div>
                {mark && <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, background: "var(--kas-orange-soft)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{mark}</span>}
              </div>
              <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[{ k: "Hadir", l: "Hadir" }, { k: "Setengah", l: "1/2 Hari" }, { k: "Tidak", l: "Tidak" }].map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => setMark(w.id, opt.k)}
                    className="py-2.5 cursor-pointer"
                    style={{
                      border: `1px solid ${mark === opt.k ? "var(--kas-ink)" : "var(--kas-line)"}`,
                      background: mark === opt.k ? "var(--kas-ink)" : "var(--kas-paper)",
                      color: mark === opt.k ? "var(--kas-paper)" : "var(--kas-ink)",
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AMBilling({ toast }: { toast: (m: string) => void }) {
  const outstanding = PROJECTS.filter((p) => p.contractValue > p.paid);
  const total = outstanding.reduce((s, p) => s + (p.contractValue - p.paid), 0);

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label={`${outstanding.length} BELUM LUNAS`} />
      <DisplayHeading size={28}>Tagihan,<br /><em>aktif.</em></DisplayHeading>

      <div className="mt-4 p-4" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
        <MonoLabel size={10} color="rgba(251,248,241,0.6)">Total Outstanding</MonoLabel>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, fontWeight: 500, marginTop: 6, color: "var(--kas-orange)" }}>{fmtIDR(total)}</div>
      </div>

      <div className="mt-4">
        {outstanding.map((p) => {
          const sisa = p.contractValue - p.paid;
          return (
            <div key={p.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-baseline">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{p.client.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-orange)", fontWeight: 600 }}>{fmtIDRshort(sisa)}</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.name}</div>
              <div className="grid gap-1.5 mt-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button onClick={() => toast("Status diubah ke Lunas.")} style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "10px 0", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>Tandai Lunas</button>
                <button onClick={() => toast("Pesan WhatsApp dibuat.")} className="flex items-center justify-center gap-1.5" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  <WAIcon />
                  Tagih WA
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AMMore({ session, toast, onLogout }: { session: { name: string; short: string }; toast: (m: string) => void; onLogout: () => void }) {
  const [showCreate, setShowCreate] = useState(false);

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
        <Kicker no="02" label="MANAJEMEN PEKERJA" />
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

function WAIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4z" /></svg>;
}
