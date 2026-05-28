"use client";
import { useState, useRef } from "react";

type UploadState = "idle" | "selected" | "submitted";

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 16V8m0 0-3 3m3-3 3 3" strokeLinecap="square" />
      <rect x="3" y="3" width="18" height="18" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4h10l6 6v10H4V4z" />
      <path d="M14 4v6h6" />
      <path d="M8 12h2.5c.8 0 1.5.7 1.5 1.5S11.3 15 10.5 15H8v-3z" />
      <path d="M13 12h1.5a2 2 0 010 4H13v-4z" />
      <path d="M17 12v4" />
    </svg>
  );
}

export function PaymentProofUpload({ outstanding }: { outstanding: number }) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (outstanding <= 0) return null;

  const handleFile = (f: File) => {
    const isImage = f.type.startsWith("image/");
    const isPdf = f.type === "application/pdf";
    if (!isImage && !isPdf) return;

    setFile(f);
    if (isImage) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
    setUploadState("selected");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setUploadState("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const label: React.CSSProperties = {
    fontFamily: "var(--font-jetbrains), monospace",
    fontSize: 9,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--kas-ink-3)",
    marginBottom: 12,
  };

  const mono10: React.CSSProperties = {
    fontFamily: "var(--font-jetbrains), monospace",
    fontSize: 10,
    letterSpacing: "0.08em",
  };

  if (uploadState === "submitted") {
    return (
      <div style={{ padding: "20px 28px", borderTop: "1px solid var(--kas-line)" }}>
        <div style={label}>Bukti Pembayaran</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px", background: "var(--kas-moss-soft)", border: "1px solid var(--kas-line)" }}>
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>✓</span>
          <div>
            <div style={{ ...mono10, fontWeight: 700, color: "var(--kas-moss-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Bukti Terkirim
            </div>
            <div style={{ ...mono10, color: "var(--kas-ink-3)", marginTop: 4, lineHeight: 1.5 }}>
              {file?.name}<br />Tim kami akan memverifikasi segera.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 28px", borderTop: "1px solid var(--kas-line)" }}>
      <div style={label}>Upload Bukti Transfer</div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleInputChange}
        style={{ display: "none" }}
        aria-label="Pilih bukti pembayaran"
      />

      {uploadState === "idle" ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          style={{
            border: `1px dashed ${dragging ? "var(--kas-cobalt)" : "var(--kas-ink-3)"}`,
            background: dragging ? "var(--kas-paper-2)" : "var(--kas-paper)",
            padding: "24px 16px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            transition: "border-color 0.1s, background 0.1s",
          }}
        >
          <span style={{ color: "var(--kas-ink-3)" }}><UploadIcon /></span>
          <div style={{ ...mono10, color: "var(--kas-ink-3)", textAlign: "center", lineHeight: 1.6 }}>
            Seret file ke sini, atau klik untuk pilih<br />
            <span style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>JPG · PNG · PDF · maks 10 MB</span>
          </div>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)" }}>
          {preview ? (
            <img
              src={preview}
              alt="preview"
              style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 12, color: "var(--kas-ink-3)" }}>
              <PdfIcon />
              <div>
                <div style={{ ...mono10, color: "var(--kas-ink)", fontWeight: 600 }}>{file?.name}</div>
                <div style={{ ...mono10, fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2 }}>{file ? fmtSize(file.size) : ""}</div>
              </div>
            </div>
          )}
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--kas-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ ...mono10, fontSize: 9, color: "var(--kas-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
              {file?.name}
              {file && <span style={{ marginLeft: 6, opacity: 0.6 }}>{fmtSize(file.size)}</span>}
            </div>
            <button
              onClick={reset}
              style={{ border: "none", background: "transparent", ...mono10, fontSize: 9, color: "var(--kas-ink-3)", cursor: "pointer", letterSpacing: "0.14em", textTransform: "uppercase", flexShrink: 0 }}
            >
              Ganti
            </button>
          </div>
        </div>
      )}

      {uploadState === "selected" && (
        <button
          onClick={() => setUploadState("submitted")}
          style={{
            marginTop: 10, width: "100%", padding: "13px 0",
            border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)",
            fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
          }}
        >
          Kirim Bukti Pembayaran →
        </button>
      )}
    </div>
  );
}
