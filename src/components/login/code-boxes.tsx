import { useRef } from "react";

export function CodeBoxes({
  value,
  length,
  numeric,
  disabled,
  autoFocus,
  onChange,
}: {
  value: string;
  length: number;
  numeric?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = numeric
      ? e.target.value.replace(/\D/g, "").slice(0, length)
      : e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, length);
    onChange(raw);
  };

  return (
    <div className="relative">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${length}, 1fr)` }}>
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            onClick={() => inputRef.current?.focus()}
            className="grid place-items-center cursor-text"
            style={{
              height: 52,
              border: `1px solid ${i === value.length ? "var(--kas-cobalt)" : "var(--kas-ink)"}`,
              background: value.length > i ? "var(--kas-ink)" : "var(--kas-paper-2)",
              color: "var(--kas-paper)",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 18,
              fontWeight: 500,
              transition: "border-color 0.1s",
            }}
          >
            {value.length > i ? (numeric ? value[i] : "●") : ""}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type={numeric ? "tel" : "text"}
        inputMode={numeric ? "numeric" : "text"}
        autoCapitalize={numeric ? "none" : "characters"}
        autoComplete="one-time-code"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={autoFocus}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={length}
        className="absolute inset-0 opacity-0 cursor-text"
        style={{ fontSize: 0 }}
        aria-label="Kode"
      />
    </div>
  );
}
