export function ConfirmDialog({
  message,
  sub,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel  = "Belum",
  onConfirm,
  onCancel,
}: {
  message:       string;
  sub?:          string;
  confirmLabel?: string;
  cancelLabel?:  string;
  onConfirm:     () => void;
  onCancel:      () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-5"
      style={{ background: "rgba(22,28,44,0.5)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md"
        style={{ background: "var(--kas-paper)", border: "2px solid var(--kas-ink)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-2">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 22, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            {message}
          </div>
          {sub && (
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 8, lineHeight: 1.5 }}>
              {sub}
            </div>
          )}
        </div>

        <div className="grid px-6 pb-6 pt-4 gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
