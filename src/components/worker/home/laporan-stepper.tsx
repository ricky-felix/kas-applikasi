"use client";
import { useRef, useState, useEffect } from "react";
import { type Project } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { SelfieCapture } from "@/components/worker/home/clock-section";

// ── Shared stamp helpers ────────────────────────────────────────────────────
const _DAYS   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const _MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
const fmtD = (d: Date) => `${_DAYS[d.getDay()]}, ${d.getDate()} ${_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmtT = (d: Date) => `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")} WIB`;
const genDocCode = () => { const d = new Date(); const dt = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`; return `DOC-${dt}-${Math.random().toString(16).slice(2,6).toUpperCase()}`; };

async function reverseGeocodeDoc(lat: number, lng: number): Promise<string|null> {
  const tryFetch = async (url: string): Promise<string|null> => {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 5000);
    try {
      const r = await fetch(url, { signal: ctrl.signal, headers: { "Accept-Language": "id,en" } });
      clearTimeout(tid);
      const d = await r.json();
      const a = d.address ?? {};
      const road = a.road ?? a.pedestrian ?? a.footway ?? null;
      const area = a.suburb ?? a.neighbourhood ?? a.city_district ?? a.village ?? a.town ?? null;
      const city = (a.city ?? a.town ?? a.county ?? "").replace(/^Kota /, "");
      if (road) return [road, area ?? city].filter(Boolean).join(", ");
      return [area, city].filter(Boolean).join(", ") || null;
    } catch { clearTimeout(tid); return null; }
  };
  return (
    await tryFetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`) ??
    await tryFetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`) ??
    null
  );
}

// Burns the TimeMark stamp into a canvas copy of the image
async function stampImage(src: string, data: { workerName: string; phase: string; projectCode: string; date: Date; coords: string|null; locationName: string|null; docCode: string }): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.width; const h = img.height;
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const stampH = Math.round(Math.max(h * 0.20, 90));
      const y0  = h - stampH;
      const pad = Math.round(w * 0.03);
      const f   = Math.round(Math.max(w * 0.036, 11));

      ctx.fillStyle = "rgba(0,0,0,0.78)";
      ctx.fillRect(0, y0, w, stampH);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke();

      let ty = y0 + pad + Math.round(f * 1.3);
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.round(f * 1.3)}px -apple-system,Arial,sans-serif`;
      ctx.fillText(data.workerName.toUpperCase(), pad, ty);
      ty += Math.round(f * 1.5);

      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.font = `${f}px monospace`;
      ctx.fillText(`${fmtD(data.date)} · ${fmtT(data.date)}`, pad, ty);
      ty += Math.round(f * 1.35);

      ctx.fillStyle = "rgba(255,255,255,0.42)";
      ctx.font = `${Math.round(f * 0.88)}px monospace`;
      ctx.fillText(`${data.docCode} · ${data.projectCode} · Fase ${data.phase}`, pad, ty);
      ty += Math.round(f * 1.3);

      const loc = data.locationName ?? data.coords;
      if (loc) {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = `${Math.round(f * 0.88)}px monospace`;
        ctx.fillText(`\u{1F4CD} ${loc}`, pad, ty);
        if (data.locationName && data.coords) {
          ty += Math.round(f * 1.15);
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.font = `${Math.round(f * 0.78)}px monospace`;
          ctx.fillText(`    ${data.coords}`, pad, ty);
        }
      }
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = src;
  });
}

// ── DocumentCamera ──────────────────────────────────────────────────────────
function DocBracket({ pos }: { pos: "tl"|"tr"|"bl"|"br" }) {
  const s: React.CSSProperties = { position:"absolute", width:20, height:20, borderColor:"rgba(255,255,255,0.45)", borderStyle:"solid" };
  if (pos==="tl") { s.top=0;    s.left=0;  s.borderWidth="2px 0 0 2px"; }
  if (pos==="tr") { s.top=0;    s.right=0; s.borderWidth="2px 2px 0 0"; }
  if (pos==="bl") { s.bottom=0; s.left=0;  s.borderWidth="0 0 2px 2px"; }
  if (pos==="br") { s.bottom=0; s.right=0; s.borderWidth="0 2px 2px 0"; }
  return <div style={s} />;
}

function DocumentCamera({ project, workerName, phase, onCapture, onCancel }: {
  project: Project | undefined; workerName: string; phase: string;
  onCapture: (src: string) => void; onCancel: () => void;
}) {
  const [liveTime, setLiveTime]     = useState(new Date());
  const [captured, setCaptured]     = useState(false);
  const [coords, setCoords]         = useState<string|null>(null);
  const [locationName, setLocName]  = useState<string|null>(null);
  const [docCode]                   = useState(genDocCode);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const mountedRef = useRef(true);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current = null;
  };

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false; let localStream: MediaStream|null = null;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        localStream = stream; streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      }).catch(() => {});

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mountedRef.current) return;
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setCoords(`${lat.toFixed(4)}°LU, ${lng.toFixed(4)}°BT · ±${Math.round(acc)}m`);
        reverseGeocodeDoc(lat, lng).then(n => { if (mountedRef.current && n) setLocName(n); });
      },
      () => {},
      { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
    );

    const tick = setInterval(() => { if (mountedRef.current) setLiveTime(new Date()); }, 1000);
    return () => {
      cancelled = true; mountedRef.current = false;
      clearInterval(tick);
      localStream?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      streamRef.current = null;
    };
  }, []);

  const handleCapture = async () => {
    const now = new Date();
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 1280; canvas.height = v.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    const raw = canvas.toDataURL("image/jpeg", 0.9);
    stopCam(); setCaptured(true);
    const stamped = await stampImage(raw, { workerName, phase, projectCode: project?.code ?? "", date: now, coords, locationName, docCode });
    setTimeout(() => onCapture(stamped), 700);
  };

  const Stamp = () => (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.78)", borderTop:"1px solid rgba(255,255,255,0.07)", padding:"12px 16px 14px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontFamily:"var(--font-manrope),sans-serif", fontWeight:700, fontSize:15, color:"#fff", letterSpacing:"0.04em" }}>{workerName.toUpperCase()}</span>
        {captured && <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:9, color:"#4ade80", letterSpacing:"0.18em" }}>✓ TERDOKUMENTASI</span>}
      </div>
      <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:11, color:"rgba(255,255,255,0.85)", letterSpacing:"0.04em" }}>{fmtD(liveTime)} · {fmtT(liveTime)}</div>
      <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:10, color:"rgba(255,255,255,0.42)", letterSpacing:"0.12em", marginTop:3 }}>{docCode} · {project?.code} · Fase {phase}</div>
      <div style={{ display:"flex", alignItems:"flex-start", gap:6, marginTop:5 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,255,255,0.38)" style={{ marginTop:1, flexShrink:0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <div>
          <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:11, color:"rgba(255,255,255,0.72)", letterSpacing:"0.03em" }}>{locationName ?? (coords ? "Mengambil nama lokasi..." : "Mengidentifikasi lokasi...")}</div>
          {coords && <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:9, color:"rgba(255,255,255,0.32)", letterSpacing:"0.05em", marginTop:2 }}>{coords}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background:"#0a0a0f" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, letterSpacing:"0.24em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
          {project?.code} · Dokumentasi · Fase {phase}
        </span>
        {!captured && (
          <button type="button" onClick={() => { stopCam(); onCancel(); }} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.38)", cursor:"pointer", fontFamily:"var(--font-jetbrains),monospace", fontSize:8, letterSpacing:"0.18em", textTransform:"uppercase" }}>
            BATAL
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {!captured && (
          <video ref={videoRef} autoPlay playsInline muted style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
        )}
        {!captured && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", paddingBottom:120 }}>
            <div style={{ position:"relative", width:"70%", height:"55%" }}>
              <DocBracket pos="tl"/><DocBracket pos="tr"/><DocBracket pos="bl"/><DocBracket pos="br"/>
            </div>
          </div>
        )}
        {!captured && (
          <div style={{ position:"absolute", top:12, left:14, display:"flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.45)", padding:"3px 7px" }}>
            <span style={{ display:"inline-block", width:6, height:6, background:"#ef4444", borderRadius:"50%" }}/>
            <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, color:"rgba(255,255,255,0.6)", letterSpacing:"0.22em" }}>LIVE</span>
          </div>
        )}
        <Stamp />
      </div>

      {!captured ? (
        <div style={{ padding:"14px 20px 22px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <button type="button" onClick={handleCapture} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"16px 0", background:"#ffffff", color:"#0a0a0f", border:"none", cursor:"pointer", fontFamily:"var(--font-manrope),sans-serif", fontWeight:700, fontSize:13, letterSpacing:"0.08em", textTransform:"uppercase" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>
            Ambil Foto
          </button>
        </div>
      ) : (
        <div style={{ padding:"20px", textAlign:"center", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, color:"rgba(255,255,255,0.28)", letterSpacing:"0.22em", textTransform:"uppercase" }}>Menyimpan foto...</div>
        </div>
      )}
    </div>
  );
}

const PHASES = [
  { key: "Sebelum", roman: "I"   },
  { key: "Sedang",  roman: "II"  },
  { key: "Sesudah", roman: "III" },
];

type Photo = { id: number; phase: string; src: string };

function CameraIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="14" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M8 6l1.5-2h5L16 6" />
    </svg>
  );
}

function UploadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

const LEMBUR_HOURS_LIST = [1, 2, 3, 4, 5];

export function LaporanStepper({
  project,
  workerName,
  onSubmit,
  onCancel,
}: {
  project: Project | undefined;
  workerName: string;
  onSubmit: (lemburJam: number) => void;
  onCancel: () => void;
}) {
  const [step, setStep]   = useState<1 | 2 | 3 | 4>(1);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [note, setNote]   = useState("");

  // Step 3: lembur
  const [lemburJam, setLemburJam]     = useState<number | null>(null);
  const [lemburPhase, setLemburPhase] = useState<"ask-lembur" | "ask-boss" | "pick-hours">("ask-lembur");
  const [showLemburSelfie, setShowLemburSelfie] = useState(false);

  const uploadRef  = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [gpsCoords, setGpsCoords]   = useState<string|null>(null);
  const [gpsName,   setGpsName]     = useState<string|null>(null);
  const gpsDocCode                  = useRef(genDocCode());

  const totalPhotos   = photos.length;
  const wordCount     = note.trim() ? note.trim().split(/\s+/).length : 0;

  // Fetch GPS once on mount — shared by camera and upload
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setGpsCoords(`${lat.toFixed(4)}°LU, ${lng.toFixed(4)}°BT · ±${Math.round(acc)}m`);
        reverseGeocodeDoc(lat, lng).then(n => { if (n) setGpsName(n); });
      },
      () => {},
      { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
    );
  }, []);

  const readFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const raw = e.target?.result as string;
        const stamped = await stampImage(raw, {
          workerName, phase: "Sedang", projectCode: project?.code ?? "",
          date: new Date(), coords: gpsCoords, locationName: gpsName,
          docCode: gpsDocCode.current,
        });
        setPhotos((prev) => [...prev, { id: Date.now() + Math.random(), phase: "Sedang", src: stamped }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: number) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  return (
    <>
    {showCamera && (
      <DocumentCamera
        project={project}
        workerName={workerName}
        phase="Sedang"
        onCapture={(src) => { setPhotos(prev => [...prev, { id: Date.now(), phase: "Sedang", src }]); setShowCamera(false); }}
        onCancel={() => setShowCamera(false)}
      />
    )}
    {showLemburSelfie && (
      <SelfieCapture
        workerName={workerName}
        onCapture={() => { setShowLemburSelfie(false); onSubmit(lemburJam ?? 0); }}
        onCancel={() => setShowLemburSelfie(false)}
      />
    )}
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: "var(--kas-paper)", color: "var(--kas-ink)" }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid var(--kas-ink)" }}>
        <div className="flex gap-2 mb-4">
          {([
            { s: 1, roman: "I",    label: "Foto"    },
            { s: 2, roman: "II",   label: "Catatan" },
            { s: 3, roman: "III",  label: "Lembur"  },
            { s: 4, roman: "IV",   label: "Selfie"  },
          ] as const).map(({ s, roman, label }) => (
            <div
              key={s}
              className="flex items-center gap-1.5 px-3 py-1.5"
              style={{
                border: "1px solid var(--kas-ink)",
                background: step === s ? "var(--kas-ink)" : "var(--kas-paper)",
                color:      step === s ? "var(--kas-paper)" : "var(--kas-ink-3)",
              }}
            >
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontStyle: "italic", lineHeight: 1 }}>
                {roman}
              </span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                {label}
              </span>
            </div>
          ))}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onCancel}
            style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
          >
            ✕ Batal
          </button>
        </div>

        {project && (
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em" }}>
            {project.code} · {project.name}
          </div>
        )}
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
          {step === 1 ? <>Dokumentasi,<br /><em>proyek hari ini.</em></> : step === 2 ? <>Laporan,<br /><em>harian.</em></> : <>Lembur,<br /><em>hari ini?</em></>}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">

        {/* ── STEP 1: Foto ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <MonoLabel size={9}>DOKUMENTASI · SEDANG BERJALAN</MonoLabel>
              {totalPhotos > 0 && (
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500 }}>
                  {String(totalPhotos).padStart(2, "0")}
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", marginLeft: 4 }}>FOTO</span>
                </span>
              )}
            </div>

            {/* Photo grid */}
            {totalPhotos > 0 && (
              <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative"
                    style={{ aspectRatio: "1 / 1", overflow: "hidden", background: "var(--kas-paper-2)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {/* Phase badge */}
                    <span
                      className="absolute bottom-0 left-0 px-1.5 py-0.5"
                      style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(22,28,44,0.72)", color: "#fff" }}
                    >
                      Sedang
                    </span>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 grid place-items-center"
                      style={{ width: 22, height: 22, background: "rgba(22,28,44,0.72)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {totalPhotos === 0 && (
              <div
                className="flex flex-col items-center justify-center mb-4"
                style={{ height: 96, border: "1px dashed var(--kas-ink-3)", background: "var(--kas-paper-2)" }}
              >
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Belum ada foto
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex flex-col items-center gap-2 py-4"
                style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-ink)", color: "var(--kas-paper)", cursor: "pointer" }}
              >
                <CameraIcon size={22} />
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Kamera
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.1em", opacity: 0.5, textTransform: "uppercase" }}>
                  Fase Sedang
                </span>
              </button>

              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="flex flex-col items-center gap-2 py-4"
                style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", color: "var(--kas-ink)", cursor: "pointer" }}
              >
                <UploadIcon size={22} />
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Unggah
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.1em", opacity: 0.5, textTransform: "uppercase" }}>
                  Dari galeri
                </span>
              </button>
            </div>

            {/* Hidden file input for gallery upload */}
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { readFiles(e.target.files); e.target.value = ""; }}
            />
          </div>
        )}

        {/* ── STEP 2: Catatan ───────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <MonoLabel size={9}>CATATAN HARIAN</MonoLabel>
              {wordCount > 0 && (
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}>
                  {wordCount} kata
                </span>
              )}
            </div>

            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Progres hari ini, kendala yang ditemukan, dan rencana untuk besok..."
              rows={7}
              className="w-full px-4 py-3.5 resize-none"
              style={{
                border: "1px solid var(--kas-ink)",
                background: "var(--kas-paper)",
                fontFamily: "var(--font-newsreader), serif",
                fontSize: 16, lineHeight: 1.65,
                color: "var(--kas-ink)",
                outline: "none",
                display: "block",
              }}
            />

            {totalPhotos > 0 && (
              <div className="mt-3 px-3 py-2.5" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>Sedang · Foto dilampirkan</div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontWeight: 500, lineHeight: 1, marginTop: 2 }}>{String(totalPhotos).padStart(2, "0")}</div>
              </div>
            )}

            <div className="mt-3 px-3 py-2.5" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 4 }}>
                Ringkasan laporan
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.06em" }}>
                {totalPhotos > 0 ? `${totalPhotos} foto dilampirkan` : "Tidak ada foto"} · {workerName}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── STEP 3: Lembur ───────────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">

          {lemburPhase === "ask-lembur" && (
            <>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-ink)", lineHeight: 1.3, marginBottom: 16 }}>
                Apakah ada lembur hari ini?
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => setLemburPhase("ask-boss")}
                  className="w-full py-4"
                  style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>
                  Iya
                </button>
                <button type="button" onClick={() => { setLemburJam(0); setLemburPhase("ask-lembur"); }}
                  className="w-full py-4"
                  style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>
                  Tidak
                </button>
              </div>
              {lemburJam === 0 && (
                <div className="mt-3 px-3 py-2" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>Tidak ada lembur — siap kirim laporan</span>
                </div>
              )}
            </>
          )}

          {lemburPhase === "ask-boss" && (
            <>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-ink)", lineHeight: 1.3, marginBottom: 16 }}>
                Apakah bos sudah menyetujui lembur?
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => setLemburPhase("pick-hours")}
                  className="w-full py-4"
                  style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>
                  Iya
                </button>
                <button type="button" onClick={() => { setLemburJam(0); setLemburPhase("ask-lembur"); }}
                  className="w-full py-4"
                  style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>
                  Tidak
                </button>
              </div>
              <button type="button" onClick={() => setLemburPhase("ask-lembur")}
                style={{ marginTop: 10, border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0" }}>
                ← Kembali
              </button>
            </>
          )}

          {lemburPhase === "pick-hours" && (
            <>
              <div className="mb-3 px-3 py-2" style={{ background: "var(--kas-moss-soft)", border: "1px solid var(--kas-moss)" }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-moss-ink)", letterSpacing: "0.12em", textTransform: "uppercase" }}>✓ Disetujui bos</span>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 10 }}>
                Berapa jam lembur?
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                {LEMBUR_HOURS_LIST.map((h) => (
                  <button key={h} type="button" onClick={() => setLemburJam(h)}
                    style={{ border: `1px solid ${lemburJam === h ? "var(--kas-ochre)" : "var(--kas-line)"}`, background: lemburJam === h ? "var(--kas-ochre)" : "var(--kas-paper)", padding: "16px 0", fontFamily: "var(--font-newsreader), serif", fontSize: 24, fontWeight: 500, cursor: "pointer", textAlign: "center" }}>
                    {h}<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10 }}>j</span>
                  </button>
                ))}
              </div>
              {lemburJam !== null && lemburJam > 0 && (
                <div className="mt-4 px-4 py-3" style={{ background: "var(--kas-ochre-soft)", border: "1px solid var(--kas-ochre)" }}>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-ochre-ink)" }}>
                    Lembur <em>{lemburJam} jam</em>
                  </div>
                </div>
              )}
              <button type="button" onClick={() => { setLemburPhase("ask-boss"); setLemburJam(null); }}
                style={{ marginTop: 10, border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0" }}>
                ← Kembali
              </button>
            </>
          )}

        </div>
      )}

      {/* ── Footer actions ────────────────────────────────────────────────── */}
      <div className="px-5 pb-6 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid var(--kas-line)" }}>
        {step === 1 ? (
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-4"
            style={{
              border: "none",
              background: "var(--kas-ink)",
              color: "var(--kas-paper)",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 13, fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {totalPhotos > 0 ? `Lanjut dengan ${totalPhotos} foto →` : "Lanjut tanpa foto →"}
          </button>
        ) : step === 2 ? (
          <>
            <button
              type="button"
              onClick={() => { if (note.trim()) setStep(3); }}
              className="w-full py-4"
              style={{
                border: "none",
                background: note.trim() ? "var(--kas-ink)" : "var(--kas-line)",
                color: note.trim() ? "var(--kas-paper)" : "var(--kas-ink-3)",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: note.trim() ? "pointer" : "default",
              }}
            >
              Lanjut →
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2"
              style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
            >
              ← Kembali ke Foto
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { if (lemburJam !== null) setShowLemburSelfie(true); }}
              className="w-full py-4"
              style={{
                border: "none",
                background: lemburJam !== null ? "var(--kas-ink)" : "var(--kas-line)",
                color: lemburJam !== null ? "var(--kas-paper)" : "var(--kas-ink-3)",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: lemburJam !== null ? "pointer" : "default",
              }}
            >
              {lemburJam !== null && lemburJam > 0
                ? `Lanjut · Selfie Lembur ${lemburJam}j →`
                : "Lanjut · Selfie & Kirim →"}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2"
              style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
            >
              ← Kembali ke Catatan
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
}
