export function BackButton({ label = "← Kembali", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0", textAlign: "left" }}
    >
      {label}
    </button>
  );
}

export function ErrorHint({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-rust)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8 }}>
      {message}
    </div>
  );
}
