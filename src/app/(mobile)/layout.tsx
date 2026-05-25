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
          "relative w-full min-h-screen overflow-y-auto",
          "sm:min-h-0 sm:w-[480px] sm:max-h-[calc(100vh-4rem)]",
          "sm:overflow-hidden sm:rounded-none",
          "sm:shadow-[0_0_0_1px_var(--kas-ink),0_24px_64px_rgba(14,12,9,0.22)]",
        ].join(" ")}
        style={{ background: "var(--kas-paper)" }}
      >
        {children}
      </div>
    </div>
  );
}
