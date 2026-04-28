export function WiruLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center rounded-lg"
        style={{
          width: size,
          height: size,
          background: "var(--gradient-primary)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          width={size * 0.6}
          height={size * 0.6}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-background"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight">wiru ia</span>
      </div>
    </div>
  );
}
