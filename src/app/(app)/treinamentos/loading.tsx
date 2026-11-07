const shimmer = {
  background: "linear-gradient(90deg, var(--nevoa) 25%, var(--border) 50%, var(--nevoa) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: "var(--radius-md)",
} as const;

function Block({ w, h }: { w: number | string; h: number }) {
  return (
    <div
      style={{
        ...shimmer,
        width: typeof w === "number" ? w : w,
        height: h,
        flexShrink: 0,
      }}
    />
  );
}

export default function TreinamentosLoading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          from { background-position: -200% 0; }
          to { background-position: 200% 0; }
        }
      `}</style>

      {/* Sticky top bar */}
      <div
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Block w={80} h={12} />
          <Block w={4} h={12} />
          <Block w={96} h={12} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Block w={28} h={28} />
          <Block w={130} h={32} />
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: "28px 32px", maxWidth: 1200 }}>
        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <Block w={180} h={24} />
          <div style={{ marginTop: 8 }}>
            <Block w={260} h={14} />
          </div>
        </div>

        {/* Filters row: search + selects */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <Block w="40%" h={36} />
          <Block w={140} h={36} />
          <Block w={140} h={36} />
          <Block w={120} h={36} />
        </div>

        {/* Table */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 1.2fr 1fr 1fr",
              gap: 16,
              padding: "12px 24px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {[80, 100, 90, 80, 70].map((w, i) => (
              <Block key={i} w={w} h={10} />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr 1.2fr 1fr 1fr",
                gap: 16,
                padding: "14px 24px",
                borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                alignItems: "center",
              }}
            >
              <Block w={72} h={12} />
              <Block w={110} h={12} />
              <Block w={90} h={12} />
              <Block w={80} h={12} />
              <Block w={64} h={22} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
