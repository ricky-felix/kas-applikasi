export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full min-h-screen sm:flex sm:items-center sm:justify-center sm:py-8"
      style={{ background: "var(--kas-bg)" }}
    >
      {/*
        Mobile  (<sm): fill the full viewport — no padding, no border.
        Desktop (≥sm): centred card, max 480px wide, natural height with a
                       border that mimics the original phone shell.
      */}
      <div
        className={[
          "relative w-full h-[100dvh] overflow-hidden",
          "sm:h-[calc(100vh-4rem)] sm:w-[480px]",
          "sm:shadow-[0_0_0_1px_var(--kas-ink),0_24px_64px_rgba(22,28,44,0.22)]",
        ].join(" ")}
        style={{ background: "var(--kas-paper)" }}
      >
        {children}
        <div
          className="absolute inset-x-0 bottom-0 flex justify-center items-center py-1 pointer-events-none"
          style={{ zIndex: 999 }}
        >
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(22,28,44,0.22)" }}>
            Demo · Data Fiktif
          </span>
        </div>
      </div>
    </div>
  );
}
