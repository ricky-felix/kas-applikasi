"use client";
import { useState, useEffect, useRef } from "react";
import type { Project } from "@/lib/data";
import { useProjects } from "@/lib/projects-store";
import { Kicker, MonoLabel } from "@/components/primitives";
import { ConfirmDialog } from "./confirm-dialog";

type LemburType = "malam" | "pagi";
type Session = { id: number; projectId: string; in: string; out: string | null; lemburType?: LemburType };
type Step = "idle" | "location-confirm" | "selfie";

// Lembur mirrors absensi — the clock decides the kind of attendance:
//   05:00–16:59 → normal absensi
//   17:00–23:59 → lembur malam
//   00:00–04:59 → lembur pagi
const LEMBUR_MALAM_FROM = 17; // 5 PM
const LEMBUR_PAGI_UNTIL = 5;  // 5 AM
export function classifyAttendance(d: Date = new Date()): "normal" | LemburType {
  const h = d.getHours();
  if (h >= LEMBUR_MALAM_FROM) return "malam";
  if (h < LEMBUR_PAGI_UNTIL)  return "pagi";
  return "normal";
}

const DAYS_ID   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const MONTHS_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];

function fmtStampDate(d: Date) {
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtStampTime(d: Date) {
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")} WIB`;
}
function genCode() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const rand = Math.random().toString(16).slice(2,6).toUpperCase();
  return `ABS-${date}-${rand}`;
}

function Bracket({ pos }: { pos: "tl"|"tr"|"bl"|"br" }) {
  const s: React.CSSProperties = { position:"absolute", width:18, height:18, borderColor:"rgba(255,255,255,0.45)", borderStyle:"solid" };
  if (pos==="tl") { s.top=0;    s.left=0;  s.borderWidth="2px 0 0 2px"; }
  if (pos==="tr") { s.top=0;    s.right=0; s.borderWidth="2px 2px 0 0"; }
  if (pos==="bl") { s.bottom=0; s.left=0;  s.borderWidth="0 0 2px 2px"; }
  if (pos==="br") { s.bottom=0; s.right=0; s.borderWidth="0 2px 2px 0"; }
  return <div style={s} />;
}

type PermStatus = "pending" | "granted" | "denied";

// ── Face detection (bundled BlazeFace + TF.js WebGL backend) ────────────────
// Models are imported lazily so TF.js is only pulled into the bundle when the
// selfie screen actually mounts (it's a large dependency).
type FaceStatus = "loading" | "searching" | "detected" | "unavailable";

// A face must clear this confidence before it counts, and it must hold for a
// few consecutive frames — this stops a single noisy frame (or a face-like
// pattern on a wall) from falsely unlocking the shutter.
const FACE_MIN_PROBABILITY = 0.9;
const FACE_CONFIRM_FRAMES  = 2;

type BlazeFaceModel = {
  estimateFaces: (
    input: HTMLVideoElement,
    returnTensors?: boolean,
  ) => Promise<{ probability?: number | number[] }[]>;
};

async function loadFaceModel(): Promise<BlazeFaceModel> {
  const [tf, blazeface] = await Promise.all([
    import("@tensorflow/tfjs-core"),
    import("@tensorflow-models/blazeface"),
  ]);
  // Registers the WebGL backend as a side effect.
  await import("@tensorflow/tfjs-backend-webgl");
  await tf.ready();
  return blazeface.load() as unknown as Promise<BlazeFaceModel>;
}

// BlazeFace reports `probability` as either a number or a 1-element array
// depending on version/return mode — normalise to a plain number.
function faceProbability(face: { probability?: number | number[] }): number {
  const p = face.probability;
  if (Array.isArray(p)) return p[0] ?? 0;
  return typeof p === "number" ? p : 0;
}

export function SelfieCapture({ workerName, onCapture, onCancel }: { workerName: string; onCapture: () => void; onCancel: () => void }) {
  const [phase, setPhase]             = useState<"viewfinder"|"captured">("viewfinder");
  const [liveTime, setLiveTime]       = useState(new Date());
  const [capturedAt, setCapturedAt]     = useState<Date|null>(null);
  const [coords, setCoords]             = useState<string|null>(null);
  const [locationName, setLocationName] = useState<string|null>(null);
  const [capturedImg, setCapturedImg]   = useState<string|null>(null);
  const [camStatus, setCamStatus]       = useState<PermStatus>("pending");
  const [gpsStatus, setGpsStatus]       = useState<PermStatus>("pending");
  const [faceStatus, setFaceStatus]     = useState<FaceStatus>("loading");
  const [attCode]                       = useState(genCode);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream|null>(null);

  const mountedRef    = useRef(true);
  const watchIdRef    = useRef<number | null>(null);
  const gpsTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const faceModelRef  = useRef<BlazeFaceModel | null>(null);
  const faceTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceHitsRef   = useRef(0);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current = null;
  };
  const stopWatch = () => {
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    if (gpsTimerRef.current !== null) { clearTimeout(gpsTimerRef.current); gpsTimerRef.current = null; }
  };

  // Reverse geocode: BigDataCloud → Nominatim zoom=16 → Nominatim zoom=13
  const reverseGeocode = async (lat: number, lng: number) => {
    const tryFetch = async (url: string, parse: (d: Record<string, unknown>) => string | null): Promise<string | null> => {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 5000);
      try {
        const r = await fetch(url, { signal: ctrl.signal, headers: { "Accept-Language": "id,en" } });
        clearTimeout(tid);
        const d = await r.json() as Record<string, unknown>;
        return parse(d);
      } catch { clearTimeout(tid); return null; }
    };

    const parseBDC = (d: Record<string, unknown>) => {
      const locality = d.locality as string | undefined;
      const city     = d.city     as string | undefined;
      const sub      = d.principalSubdivision as string | undefined;
      const name = locality || city || sub || null;
      const extra = locality && city && city !== locality ? city : null;
      const label = [name, extra].filter(Boolean).join(", ");
      return label || null;
    };

    const parseNominatim = (d: Record<string, unknown>) => {
      const a    = (d.address ?? {}) as Record<string, string>;
      const road = a.road ?? a.pedestrian ?? a.footway ?? a.path ?? null;
      const area = a.suburb ?? a.neighbourhood ?? a.city_district ?? a.village ?? a.town ?? null;
      const city = (a.city ?? a.town ?? a.county ?? "").replace(/^Kota /, "");
      // Prefer: "Jalan X, Kelurahan Y" or "Jalan X, Medan" — always lead with road if available
      if (road) return [road, area ?? city].filter(Boolean).join(", ");
      return [area, city].filter(Boolean).join(", ") || null;
    };

    // 1. Nominatim zoom=18 — most specific, includes road name
    let result = await tryFetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`,
      parseNominatim
    );
    if (result) { if (mountedRef.current) setLocationName(result); return; }

    // 2. Nominatim zoom=16 — street level, wider search radius
    result = await tryFetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`,
      parseNominatim
    );
    if (result) { if (mountedRef.current) setLocationName(result); return; }

    // 3. BigDataCloud — district level fallback (no road, but reliable)
    result = await tryFetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
      parseBDC
    );
    if (result) { if (mountedRef.current) setLocationName(result); return; }

    // 4. Nominatim zoom=13 — widest, catches sparse OSM coverage
    result = await tryFetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=13`,
      parseNominatim
    );
    if (result && mountedRef.current) setLocationName(result);
    // If all fail, coords alone remain in the stamp
  };

  const handleGpsSuccess = (pos: GeolocationPosition) => {
    stopWatch();
    if (!mountedRef.current) return;
    const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
    setCoords(`${lat.toFixed(4)}°LU, ${lng.toFixed(4)}°BT · ±${Math.round(acc)}m`);
    setGpsStatus("granted");
    reverseGeocode(lat, lng);
  };

  const gpsResolvedRef = useRef(false);

  const startGps = () => {
    setGpsStatus("pending");
    setCoords(null);
    setLocationName(null);
    gpsResolvedRef.current = false;
    stopWatch();

    const onSuccess = (pos: GeolocationPosition) => {
      gpsResolvedRef.current = true;
      handleGpsSuccess(pos);
    };
    const onError = () => {
      gpsResolvedRef.current = true;
      stopWatch();
      if (mountedRef.current) setGpsStatus("denied");
    };

    const startWatch = () => {
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError,
        { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }
      );
    };

    // Check permission state first — skip waiting if already denied
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (!mountedRef.current) return;
        if (result.state === "denied") {
          gpsResolvedRef.current = true;
          setGpsStatus("denied");
        } else {
          startWatch();
        }
      }).catch(() => {
        // permissions API not supported for geolocation — fall through to watchPosition
        if (mountedRef.current) startWatch();
      });
    } else {
      startWatch();
    }

    // Hard fallback: if the browser never calls back (dismissed prompt, slow device)
    gpsTimerRef.current = setTimeout(() => {
      if (!mountedRef.current || gpsResolvedRef.current) return;
      stopWatch();
      setGpsStatus("denied");
    }, 8000);
  };

  // Request both permissions on mount simultaneously
  useEffect(() => {
    // Reset mounted flag — Strict Mode runs cleanup then re-runs the effect;
    // without this reset, the re-run sees mountedRef=false and skips everything.
    mountedRef.current = true;

    // Local cancelled flag — scoped to this effect invocation.
    // Stops async callbacks from a stale effect run from touching the DOM.
    let cancelled = false;
    let localStream: MediaStream | null = null;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        localStream = stream;
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamStatus("granted");
      })
      .catch(() => { if (!cancelled) setCamStatus("denied"); });

    startGps();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      localStream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      streamRef.current = null;
      stopWatch();
    };
  }, []);

  // Live clock in viewfinder
  useEffect(() => {
    if (phase !== "viewfinder") return;
    const id = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Load BlazeFace and continuously check for a real face in the live frame.
  // A face only counts once it clears FACE_MIN_PROBABILITY for several
  // consecutive frames. If the model genuinely can't initialise (e.g. no WebGL
  // support), fall back to "unavailable" so the selfie isn't hard-blocked.
  useEffect(() => {
    let cancelled = false;
    let inferring = false;
    const stopLoop = () => {
      if (faceTimerRef.current) { clearInterval(faceTimerRef.current); faceTimerRef.current = null; }
    };

    // If the model can't load/initialise in time, stop blocking the selfie.
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) setFaceStatus((s) => (s === "loading" ? "unavailable" : s));
    }, 15000);

    (async () => {
      try {
        const model = await loadFaceModel();
        if (cancelled) return;
        faceModelRef.current = model;
        faceHitsRef.current = 0;
        setFaceStatus("searching");

        faceTimerRef.current = setInterval(async () => {
          const v = videoRef.current;
          const m = faceModelRef.current;
          if (!v || !m || v.readyState < 2 || inferring) return;
          inferring = true;
          try {
            const faces = await m.estimateFaces(v, false);
            const hasFace = faces.some((f) => faceProbability(f) >= FACE_MIN_PROBABILITY);
            faceHitsRef.current = hasFace ? faceHitsRef.current + 1 : 0;
            if (!cancelled) {
              setFaceStatus(faceHitsRef.current >= FACE_CONFIRM_FRAMES ? "detected" : "searching");
            }
          } catch { /* transient inference error — keep last status */ }
          finally { inferring = false; }
        }, 400);
      } catch {
        if (!cancelled) setFaceStatus("unavailable");
      }
    })();

    return () => { cancelled = true; clearTimeout(fallbackTimer); stopLoop(); };
  }, []);

  // Face must be detected, unless detection is unavailable (CDN blocked).
  const faceOk     = faceStatus === "detected" || faceStatus === "unavailable";
  const canCapture = camStatus === "granted" && gpsStatus === "granted" && faceOk;

  const handleCapture = () => {
    if (!canCapture) return;
    if (faceTimerRef.current) { clearInterval(faceTimerRef.current); faceTimerRef.current = null; }
    const now = new Date();
    if (videoRef.current) {
      const v = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width  = v.videoWidth  || 640;
      canvas.height = v.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); ctx.drawImage(v, 0, 0); }
      setCapturedImg(canvas.toDataURL("image/jpeg", 0.85));
    }
    stopCamera();
    setCapturedAt(now);
    setPhase("captured");
    setTimeout(onCapture, 1800);
  };

  const displayTime = capturedAt ?? liveTime;

  const Stamp = () => (
    <div style={{ background:"rgba(0,0,0,0.78)", borderTop:"1px solid rgba(255,255,255,0.07)", padding:"12px 16px 14px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontFamily:"var(--font-manrope),sans-serif", fontWeight:700, fontSize:15, color:"#fff", letterSpacing:"0.04em" }}>
          {workerName.toUpperCase()}
        </span>
        {phase === "captured" && (
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:16, height:16, border:"1.5px solid #4ade80", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3.5"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:9, color:"#4ade80", letterSpacing:"0.18em", textTransform:"uppercase" }}>TERVERIFIKASI</span>
          </div>
        )}
      </div>
      <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:11, color:"rgba(255,255,255,0.85)", letterSpacing:"0.04em" }}>
        {fmtStampDate(displayTime)} · {fmtStampTime(displayTime)}
      </div>
      <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:10, color:"rgba(255,255,255,0.42)", letterSpacing:"0.12em", marginTop:3 }}>
        {attCode}
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", gap:6, marginTop:5 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill={gpsStatus==="denied" ? "#f87171" : "rgba(255,255,255,0.38)"} stroke="none" style={{ marginTop:1, flexShrink:0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <div>
          {gpsStatus === "denied" ? (
            <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:10, color:"#f87171", letterSpacing:"0.06em" }}>Lokasi ditolak — wajib diizinkan</div>
          ) : (
            <>
              <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:11, color:"rgba(255,255,255,0.75)", letterSpacing:"0.03em" }}>
                {locationName ?? (gpsStatus === "granted" ? "Mengambil nama lokasi..." : "Mengidentifikasi lokasi...")}
              </div>
              {coords && (
                <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.05em", marginTop:2 }}>
                  {coords}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background:"#0a0a0f" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, letterSpacing:"0.24em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
          CV Karya Agung Sejati · Verifikasi Kehadiran
        </span>
        {phase === "viewfinder" && (
          <button type="button" onClick={() => { stopCamera(); stopWatch(); onCancel(); }} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.38)", cursor:"pointer", fontFamily:"var(--font-jetbrains),monospace", fontSize:8, letterSpacing:"0.18em", textTransform:"uppercase" }}>
            BATAL
          </button>
        )}
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        {/* Live camera feed */}
        {phase === "viewfinder" && camStatus !== "denied" && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)" }}
          />
        )}

        {/* Captured photo */}
        {phase === "captured" && capturedImg && (
          <img src={capturedImg} alt="selfie" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
        )}

        {/* Camera denied overlay */}
        {camStatus === "denied" && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:"0 32px", textAlign:"center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5"><rect x="3" y="6" width="18" height="14"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
            <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:9, color:"#f87171", letterSpacing:"0.1em", lineHeight:1.7 }}>Kamera ditolak</span>
          </div>
        )}

        {/* Guide brackets — only in viewfinder */}
        {phase === "viewfinder" && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", paddingBottom:90 }}>
            <div style={{ position:"relative", width:155, height:195 }}>
              <Bracket pos="tl"/><Bracket pos="tr"/><Bracket pos="bl"/><Bracket pos="br"/>
              <div style={{ position:"absolute", inset:12, border:"1px dashed rgba(255,255,255,0.15)", borderRadius:"50%" }}/>
            </div>
          </div>
        )}

        {/* LIVE indicator */}
        {phase === "viewfinder" && (
          <div style={{ position:"absolute", top:12, left:14, display:"flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.45)", padding:"3px 7px" }}>
            <span style={{ display:"inline-block", width:6, height:6, background:"#ef4444", borderRadius:"50%" }}/>
            <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, color:"rgba(255,255,255,0.6)", letterSpacing:"0.22em" }}>LIVE</span>
          </div>
        )}

        {/* Face detection indicator */}
        {phase === "viewfinder" && faceStatus !== "unavailable" && (
          <div style={{ position:"absolute", top:12, right:14, display:"flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.45)", padding:"3px 8px", border:`1px solid ${faceStatus==="detected" ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.15)"}` }}>
            {faceStatus === "detected"
              ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
              : <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.4)" }}/>}
            <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, letterSpacing:"0.16em", textTransform:"uppercase", color: faceStatus==="detected" ? "#4ade80" : "rgba(255,255,255,0.6)" }}>
              {faceStatus === "detected" ? "Wajah Terdeteksi" : faceStatus === "loading" ? "Memuat..." : "Mendeteksi Wajah..."}
            </span>
          </div>
        )}

        {/* Stamp overlay — always visible */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0 }}>
          <Stamp />
        </div>
      </div>

      {/* CTA */}
      {phase === "viewfinder" ? (
        <div style={{ padding:"12px 20px 20px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          {/* Permission + face status row */}
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            {([
              { label:"Kamera", status: camStatus, hint: null },
              { label:"Lokasi", status: gpsStatus, hint: "Izinkan di browser" },
              {
                label: "Wajah",
                status: (faceStatus === "detected" || faceStatus === "unavailable" ? "granted" : "pending") as PermStatus,
                hint: faceStatus === "loading" ? "Memuat..." : faceStatus === "searching" ? "Posisikan wajah" : null,
              },
            ] as const).map(({ label, status, hint }) => (
              <div key={label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, padding:"6px 4px", border:`1px solid ${status==="granted" ? "rgba(74,222,128,0.4)" : status==="denied" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`, background: status==="granted" ? "rgba(74,222,128,0.06)" : status==="denied" ? "rgba(248,113,113,0.08)" : "transparent" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  {status === "pending" && <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.3)" }}/>}
                  {status === "granted" && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
                  {status === "denied"  && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>}
                  <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, letterSpacing:"0.16em", textTransform:"uppercase", color: status==="granted" ? "#4ade80" : status==="denied" ? "#f87171" : "rgba(255,255,255,0.3)" }}>
                    {label}
                  </span>
                </div>
                {status === "pending" && hint && (
                  <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:7, color:"rgba(255,255,255,0.2)", letterSpacing:"0.1em" }}>{hint}</span>
                )}
              </div>
            ))}
          </div>

          {(camStatus === "denied" || gpsStatus === "denied") && (
            <div style={{ marginBottom:10, padding:"8px 10px", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
              <span style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, color:"#f87171", letterSpacing:"0.08em", lineHeight:1.7 }}>
                {camStatus==="denied" && gpsStatus==="denied"
                  ? "Kamera & lokasi wajib diizinkan. Buka pengaturan browser lalu muat ulang."
                  : camStatus==="denied"
                  ? "Kamera wajib diizinkan. Buka pengaturan browser lalu muat ulang."
                  : "Lokasi ditolak. Izinkan lokasi di pengaturan browser lalu muat ulang."}
              </span>
              {gpsStatus === "denied" && camStatus !== "denied" && (
                <button type="button" onClick={startGps} style={{ flexShrink:0, background:"none", border:"1px solid rgba(248,113,113,0.4)", color:"#f87171", fontFamily:"var(--font-jetbrains),monospace", fontSize:8, letterSpacing:"0.12em", textTransform:"uppercase", padding:"3px 8px", cursor:"pointer", whiteSpace:"nowrap" }}>
                  Coba Lagi
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleCapture}
            disabled={!canCapture}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"16px 0", background: canCapture ? "#ffffff" : "rgba(255,255,255,0.1)", color: canCapture ? "#0a0a0f" : "rgba(255,255,255,0.25)", border:"none", cursor: canCapture ? "pointer" : "default", fontFamily:"var(--font-manrope),sans-serif", fontWeight:700, fontSize:13, letterSpacing:"0.08em", textTransform:"uppercase" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>
            {canCapture
              ? "Ambil Selfie"
              : gpsStatus === "pending" || camStatus === "pending"
              ? "Menunggu izin..."
              : camStatus === "denied" || gpsStatus === "denied"
              ? "Izin diperlukan"
              : faceStatus === "loading"
              ? "Memuat pendeteksi wajah..."
              : "Posisikan wajah Anda"}
          </button>
        </div>
      ) : (
        <div style={{ padding:"20px", textAlign:"center", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontFamily:"var(--font-jetbrains),monospace", fontSize:8, color:"rgba(255,255,255,0.28)", letterSpacing:"0.22em", textTransform:"uppercase" }}>
            Menyimpan · Memproses clock-in...
          </div>
        </div>
      )}
    </div>
  );
}

function ClockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="square" />
    </svg>
  );
}

const LEMBUR_LABEL: Record<LemburType, string> = { malam: "Lembur Malam", pagi: "Lembur Pagi" };

export function ClockSection({
  selectedProj,
  activeSession,
  isAbsent,
  absentReason,
  workerName,
  onClockIn,
  onClockOut,
  onClockInLembur,
}: {
  selectedProj: Project | undefined;
  activeSession: Session | undefined;
  isAbsent: boolean;
  absentReason?: string;
  workerName: string;
  onClockIn: () => void;
  onClockOut: () => void;
  onClockInLembur: (type: LemburType) => void;
}) {
  const PROJECTS = useProjects();
  const [step, setStep] = useState<Step>("idle");
  // The clock decides whether this clock-in is normal absensi or lembur.
  const attendanceKind = classifyAttendance();

  if (!selectedProj) return null;

  const selectedActive    = activeSession && activeSession.projectId === selectedProj.id;
  const someoneElseActive = activeSession && activeSession.projectId !== selectedProj.id;
  const activeLembur      = selectedActive ? activeSession.lemburType : undefined;

  const handleMasukClick = () => setStep("location-confirm");

  const reset = () => setStep("idle");

  if (isAbsent) {
    return (
      <div className="mt-4">
        <Kicker no="02" label={`JAM KERJA · ${selectedProj.address.toUpperCase()}`} />
        <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-ochre)" }} />
            <MonoLabel size={10}>TERCATAT</MonoLabel>
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
            Tidak hadir.
          </div>
          {absentReason && (
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 6 }}>
              {absentReason}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4">
        <Kicker no="02" label={`JAM KERJA · ${selectedProj.address.toUpperCase()}`} />
        {selectedActive ? (
          <div className="p-4" style={{ background: "var(--kas-paper-2)", border: `1px solid ${activeLembur ? "var(--kas-ochre)" : "var(--kas-ink)"}` }}>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="inline-block" style={{ width: 8, height: 8, background: activeLembur ? "var(--kas-ochre)" : "var(--kas-cobalt)" }} />
              <MonoLabel size={10}>{activeLembur ? `SEDANG ${LEMBUR_LABEL[activeLembur].toUpperCase()}` : "SEDANG BEKERJA"}</MonoLabel>
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
            <button type="button" onClick={onClockOut} className="w-full mt-3.5 flex items-center justify-center gap-2.5" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, padding: "20px 14px", cursor: "pointer" }}>
              <ClockIcon />
              <span>{activeLembur ? <>Selesai <em>lembur.</em></> : <>Pulang <em>kerja.</em></>}</span>
            </button>
          </div>
        ) : someoneElseActive ? (
          <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
            <MonoLabel size={10}>Sedang aktif di proyek lain</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, margin: "8px 0 12px" }}>
              Pulang dulu dari <em>{PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}</em>, baru mulai di sini.
            </div>
            <button type="button" onClick={onClockOut} className="w-full" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "14px 12px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Pulang dari {PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleMasukClick} className="w-full flex items-center justify-center gap-3 relative" style={{ border: "none", background: attendanceKind === "normal" ? "var(--kas-ink)" : "var(--kas-ochre)", color: attendanceKind === "normal" ? "var(--kas-paper)" : "var(--kas-ink)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: attendanceKind === "normal" ? 28 : 24, padding: "26px 14px", cursor: "pointer" }}>
            <ClockIcon size={22} />
            <span>{attendanceKind === "normal" ? <>Masuk <em>kerja.</em></> : <>Masuk · <em>{LEMBUR_LABEL[attendanceKind]}.</em></>}</span>
            <span className="absolute top-2 right-2 inline-block" style={{ width: 8, height: 8, background: "var(--kas-rust)" }} />
          </button>
        )}
      </div>

      {/* Lembur context note — clarifies why the button shows lembur */}
      {!selectedActive && !someoneElseActive && attendanceKind !== "normal" && (
        <div className="mt-2 px-3 py-2.5" style={{ background: "var(--kas-ochre-soft)", border: "1px solid var(--kas-ochre)" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ochre-ink)", letterSpacing: "0.08em", lineHeight: 1.6 }}>
            {attendanceKind === "malam"
              ? "Jam normal sudah lewat pukul 17:00 — kehadiran ini dicatat sebagai lembur malam."
              : "Masuk sebelum pukul 05:00 — kehadiran ini dicatat sebagai lembur pagi."}
          </div>
        </div>
      )}

      {step === "location-confirm" && (
        <ConfirmDialog
          message="Apakah Anda sudah di lokasi proyek?"
          sub={selectedProj.address.toUpperCase()}
          confirmLabel="Ya, sudah di sini"
          cancelLabel="Belum"
          onConfirm={() => setStep("selfie")}
          onCancel={reset}
        />
      )}

      {step === "selfie" && (
        <SelfieCapture
          workerName={workerName}
          onCapture={() => {
            reset();
            if (attendanceKind === "normal") onClockIn();
            else onClockInLembur(attendanceKind);
          }}
          onCancel={reset}
        />
      )}
    </>
  );
}
