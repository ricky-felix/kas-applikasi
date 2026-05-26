"use client";
import { useState } from "react";
import { PROJECTS, MATERIALS, TODAY_SHORT } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "../ui";

type Session = { id: number; projectId: string; in: string; out: string | null };
type DayStatus = "working" | "setengah" | "tidak";

function fmtDur(mins: number) {
  return { h: Math.floor(mins / 60), m: mins % 60 };
}

function sessionMinutes(s: Session) {
  if (!s.in || !s.out) return 0;
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  return Math.max(0, toMin(s.out) - toMin(s.in));
}

function ClockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="square" />
    </svg>
  );
}

function DailyReportSection({ myProjects, toast }: { myProjects: typeof PROJECTS; toast: (m: string) => void }) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [projId, setProjId] = useState(myProjects[0]?.id || "");

  if (sent) {
    return (
      <div className="mt-5">
        <Kicker no="05" label="LAPORAN HARIAN" />
        <div className="p-4 flex items-center gap-3" style={{ background: "var(--kas-moss-soft)", border: "1px solid var(--kas-line)" }}>
          <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-moss)", flexShrink: 0 }} />
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, color: "var(--kas-moss-ink)" }}>Laporan terkirim ke Administrasi.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <Kicker no="05" label="LAPORAN HARIAN" />
      <div className="p-3.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 6 }}>Ringkasan pekerjaan hari ini</div>
        <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar">
          {myProjects.map((p) => (
            <button key={p.id} onClick={() => setProjId(p.id)} style={{ border: `1px solid ${projId === p.id ? "var(--kas-ink)" : "var(--kas-line)"}`, background: projId === p.id ? "var(--kas-ink)" : "var(--kas-paper)", color: projId === p.id ? "var(--kas-paper)" : "var(--kas-ink)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>{p.address}</button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: Lapisan ke-2 selesai 25m². Area selatan sudah kering..."
          rows={3}
          className="w-full px-3 py-2.5 resize-none"
          style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, lineHeight: 1.5, color: "var(--kas-ink)" }}
        />
        <button
          onClick={() => { if (!note.trim()) { toast("Isi catatan dulu."); return; } toast("Laporan terkirim."); setSent(true); }}
          className="w-full mt-2 py-3"
          style={{ border: "none", background: note.trim() ? "var(--kas-ink)" : "var(--kas-line)", color: note.trim() ? "var(--kas-paper)" : "var(--kas-ink-3)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: note.trim() ? "pointer" : "default" }}
        >
          Kirim Laporan →
        </button>
      </div>
    </div>
  );
}

function MaterialRequestSection({ myProjects, toast }: { myProjects: typeof PROJECTS; toast: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [projId, setProjId] = useState(myProjects[0]?.id || "");
  const [matId, setMatId] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const mat = MATERIALS.find((m) => m.id === matId);

  return (
    <div className="mt-5">
      <div className="flex justify-between items-center mb-2">
        <Kicker no="06" label="PERMINTAAN MATERIAL" />
      </div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-3.5"
          style={{ border: "1px dashed var(--kas-line)", background: "var(--kas-paper)", cursor: "pointer" }}
        >
          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>Minta material ke gudang</span>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-ink-3)" }}>→</span>
        </button>
      ) : (
        <div className="p-3.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 8 }}>Form Permintaan Material</div>
          <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
            {myProjects.map((p) => (
              <button key={p.id} onClick={() => setProjId(p.id)} style={{ border: `1px solid ${projId === p.id ? "var(--kas-ink)" : "var(--kas-line)"}`, background: projId === p.id ? "var(--kas-ink)" : "var(--kas-paper)", color: projId === p.id ? "var(--kas-paper)" : "var(--kas-ink)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>{p.address}</button>
            ))}
          </div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Pilih Material</div>
          <select value={matId} onChange={(e) => setMatId(e.target.value)} className="w-full px-3 py-2.5 mb-2" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink)" }}>
            <option value="">— pilih material —</option>
            {MATERIALS.map((m) => <option key={m.id} value={m.id}>{m.name} (stok: {m.stock} {m.unit})</option>)}
          </select>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Jumlah {mat ? `(${mat.unit})` : ""}</div>
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" type="number" className="w-full px-3 py-2.5 mb-2" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 14 }} />
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Catatan (opsional)</div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Untuk area / keperluan apa?" className="w-full px-3 py-2.5 mb-3" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }} />
          <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button onClick={() => setOpen(false)} style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Batal</button>
            <button
              onClick={() => {
                if (!matId || !qty) { toast("Pilih material dan jumlah."); return; }
                toast(`Permintaan ${mat?.name} dikirim ke admin.`);
                setOpen(false); setMatId(""); setQty(""); setNote("");
              }}
              style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Kirim →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeTab({
  myProjects, me, state, setState, clockIn, clockOut, markDayStatus, activeSession, toast,
}: {
  myProjects: typeof PROJECTS;
  me: { name: string; short: string; role: string; phone: string; rate: number; id: string };
  state: { sessions: Session[]; dayStatus: DayStatus; selectedProjectId: string; overtime: number };
  setState: (fn: (s: { sessions: Session[]; dayStatus: DayStatus; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; dayStatus: DayStatus; selectedProjectId: string; photos: number; overtime: number }) => void;
  clockIn: (pid: string) => void;
  clockOut: () => void;
  markDayStatus: (k: DayStatus) => void;
  activeSession: Session | undefined;
  toast: (m: string) => void;
}) {
  const selectedProj = myProjects.find((p) => p.id === state.selectedProjectId) || myProjects[0];
  const selectedActive = activeSession && activeSession.projectId === selectedProj?.id;
  const someoneElseActive = activeSession && activeSession.projectId !== selectedProj?.id;
  const totalDayMin = state.sessions.reduce((s, x) => s + sessionMinutes(x), 0);
  const dayDur = fmtDur(totalDayMin);
  const hasAnySession = state.sessions.length > 0;
  const isAbsent = state.dayStatus === "setengah" || state.dayStatus === "tidak";
  const minByProj = (pid: string) => state.sessions.filter((s) => s.projectId === pid).reduce((a, x) => a + sessionMinutes(x), 0);

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="00" label={TODAY_SHORT} />
      <DisplayHeading size={28}>
        Selamat pagi,<br /><em>{me.name.split(" ").slice(-1)[0]}.</em>
      </DisplayHeading>

      {isAbsent && (
        <div className="mt-4 p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-ochre)" }} />
            <MonoLabel size={10}>TERCATAT</MonoLabel>
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
            {state.dayStatus === "setengah" ? "Setengah hari." : "Tidak hadir."}
          </div>
        </div>
      )}

      {!isAbsent && (
        <div className="mt-4">
          <Kicker no="01" label={`PROYEK ANDA · ${myProjects.length}`} />
          <div className="flex flex-col gap-2">
            {myProjects.map((p) => {
              const isSelected = p.id === selectedProj?.id;
              const isActive = activeSession?.projectId === p.id;
              const mins = minByProj(p.id);
              const closed = state.sessions.filter((s) => s.projectId === p.id && s.out !== null).length;
              const dur = fmtDur(mins);
              return (
                <button
                  key={p.id}
                  onClick={() => setState((s) => ({ ...s, selectedProjectId: p.id }))}
                  className="grid gap-3 items-center text-left cursor-pointer p-3.5"
                  style={{
                    gridTemplateColumns: "auto 1fr auto",
                    border: `1px solid ${isSelected ? "var(--kas-ink)" : "var(--kas-line)"}`,
                    background: isSelected ? "var(--kas-paper-2)" : "var(--kas-paper)",
                  }}
                >
                  <span className="grid place-items-center" style={{ width: 28, height: 28, background: isActive ? "var(--kas-cobalt)" : "var(--kas-paper)", border: `1px solid ${isActive ? "var(--kas-cobalt)" : "var(--kas-line)"}`, color: isActive ? "var(--kas-paper)" : "var(--kas-ink-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                    {isActive ? "●" : closed > 0 ? "✓" : "○"}
                  </span>
                  <div className="min-w-0">
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                      {isActive ? `Sedang bekerja · sejak ${activeSession?.in}` : mins > 0 ? `${dur.h}j ${String(dur.m).padStart(2, "0")}m · ${closed} sesi` : p.address}
                    </div>
                  </div>
                  <MonoLabel size={9}>{isActive ? "AKTIF" : closed > 0 ? "SELESAI" : "MULAI"}</MonoLabel>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isAbsent && selectedProj && (
        <div className="mt-4">
          <Kicker no="02" label={`JAM KERJA · ${selectedProj.address.toUpperCase()}`} />
          {selectedActive ? (
            <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
              <div className="flex items-center gap-3 mb-2.5">
                <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-cobalt)" }} />
                <MonoLabel size={10}>SEDANG BEKERJA</MonoLabel>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)" }}>
                <div className="py-3.5 pr-3.5" style={{ borderRight: "1px solid var(--kas-line)" }}>
                  <MonoLabel size={9}>Jam Masuk</MonoLabel>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em" }}>{activeSession?.in}</div>
                </div>
                <div className="py-3.5 pl-3.5">
                  <MonoLabel size={9}>Jam Pulang</MonoLabel>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em", color: "var(--kas-ink-4)" }}>——:——</div>
                </div>
              </div>
              <button onClick={clockOut} className="w-full mt-3.5 flex items-center justify-center gap-2.5" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, padding: "20px 14px", cursor: "pointer" }}>
                <ClockIcon />
                <span>Clock <em>out.</em></span>
              </button>
            </div>
          ) : someoneElseActive ? (
            <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
              <MonoLabel size={10}>Sedang aktif di proyek lain</MonoLabel>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, margin: "8px 0 12px" }}>
                Pulang dulu dari <em>{PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}</em>, baru mulai di sini.
              </div>
              <button onClick={clockOut} className="w-full" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "14px 12px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Clock Out dari {PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}
              </button>
            </div>
          ) : (
            <button onClick={() => clockIn(selectedProj.id)} className="w-full flex items-center justify-center gap-3 relative" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 28, padding: "26px 14px", cursor: "pointer" }}>
              <ClockIcon size={22} />
              <span>Clock <em>in.</em></span>
              <span className="absolute top-2 right-2 inline-block" style={{ width: 8, height: 8, background: "var(--kas-rust)" }} />
            </button>
          )}
        </div>
      )}

      {hasAnySession && !isAbsent && (
        <div className="mt-5">
          <Kicker no="03" label={`SESI HARI INI · ${state.sessions.length}`} />
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {state.sessions.map((s, i) => {
              const proj = PROJECTS.find((p) => p.id === s.projectId);
              const live = s.out === null;
              const dur = fmtDur(sessionMinutes(s));
              return (
                <div key={s.id} className="grid gap-3 items-center py-3" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line)" }}>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 18, color: live ? "var(--kas-cobalt)" : "var(--kas-ink-3)", minWidth: 24, textAlign: "center" }}>
                    {["I","II","III","IV","V"][i] || i + 1}
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{proj?.address}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                      {s.in} — {s.out || "berjalan"}{live && <span style={{ color: "var(--kas-cobalt)", marginLeft: 6 }}>● LIVE</span>}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: live ? "var(--kas-cobalt)" : "var(--kas-ink)", fontWeight: 500 }}>
                    {live ? "—" : `${dur.h}j ${String(dur.m).padStart(2, "0")}m`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3.5 px-3.5 py-3.5 flex justify-between items-baseline" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
            <MonoLabel size={10} color="rgba(255,255,255,0.6)">Total Kerja Hari Ini</MonoLabel>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>
              {dayDur.h}<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, marginLeft: 4, color: "rgba(255,255,255,0.6)" }}>JAM</span>
              {" "}{String(dayDur.m).padStart(2, "0")}<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, marginLeft: 4, color: "rgba(255,255,255,0.6)" }}>MEN</span>
            </span>
          </div>
        </div>
      )}

      {!hasAnySession && !isAbsent && (
        <div className="mt-4">
          <Kicker no="—" label="ATAU" />
          <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button onClick={() => markDayStatus("setengah")} style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "14px 8px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Setengah Hari</button>
            <button onClick={() => markDayStatus("tidak")} style={{ border: "1px solid var(--kas-ink-3)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "14px 8px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Tidak Hadir</button>
          </div>
        </div>
      )}

      {hasAnySession && !activeSession && !isAbsent && (
        <div className="mt-5">
          <Kicker no="04" label="LEMBUR (OPSIONAL)" />
          <div className="p-3.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
            <div className="flex justify-between items-baseline">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17 }}>Jam lembur</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 500, color: state.overtime ? "var(--kas-ochre)" : "var(--kas-ink-3)" }}>
                {state.overtime > 0 ? state.overtime : "00"}
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink-3)", marginLeft: 4, letterSpacing: "0.1em" }}>JAM</span>
              </div>
            </div>
            <div className="grid gap-1.5 mt-3" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
              {[0,1,2,3,4,5].map((h) => (
                <button key={h} onClick={() => setState((s) => ({ ...s, overtime: h }))} style={{ border: `1px solid ${state.overtime === h ? "var(--kas-ink)" : "var(--kas-line)"}`, background: state.overtime === h ? "var(--kas-ink)" : "var(--kas-paper)", color: state.overtime === h ? "var(--kas-paper)" : "var(--kas-ink)", padding: "10px 0", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 500 }}>
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasAnySession && !activeSession && !isAbsent && (
        <DailyReportSection myProjects={myProjects} toast={toast} />
      )}

      {!isAbsent && (
        <MaterialRequestSection myProjects={myProjects} toast={toast} />
      )}

      {(hasAnySession || isAbsent) && (
        <button
          onClick={() => setState(() => ({ sessions: [], dayStatus: "working", selectedProjectId: myProjects[0]?.id || "", photos: 0, overtime: 0 }))}
          className="mt-4 w-full"
          style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", padding: "8px 0", textTransform: "uppercase", cursor: "pointer" }}
        >
          ↺ Reset demo
        </button>
      )}
    </div>
  );
}
