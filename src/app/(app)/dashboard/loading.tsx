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

export default function DashboardLoading() {
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
          <Block w={48} h={12} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Block w={28} h={28} />
          <Block w={120} h={32} />
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: "28px 32px", maxWidth: 1200 }}>
        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <Block w={200} h={24} />
          <div style={{ marginTop: 8 }}>
            <Block w={300} h={14} />
          </div>
        </div>

        {/* 2×2 stat cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "var(--card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border)",
                padding: "20px 24px",
                height: 120,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Block w={120} h={10} />
              <Block w={64} h={32} />
              <Block w={96} h={10} />
            </div>
          ))}
        </div>

        {/* Shortcuts section */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 12 }}>
            <Block w={64} h={10} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "var(--card)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border)",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    ...shimmer,
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-lg)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
                  <Block w="80%" h={13} />
                  <Block w="60%" h={11} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 28,
          }}
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "var(--card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border)",
                padding: "20px 24px",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <Block w={180} h={15} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Block w="100%" h={11} />
                    <Block w="100%" h={8} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent trainings table */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <Block w={160} h={15} />
            <Block w={120} h={12} />
          </div>
          <div style={{ padding: "0 24px" }}>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 1.2fr 1fr",
                gap: 16,
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {[80, 100, 110, 100, 120, 80].map((w, i) => (
                <Block key={i} w={w} h={10} />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1.2fr 1fr",
                  gap: 16,
                  padding: "14px 0",
                  borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                }}
              >
                <Block w={72} h={12} />
                <Block w={90} h={12} />
                <Block w={100} h={12} />
                <Block w={80} h={12} />
                <Block w={110} h={12} />
                <Block w={70} h={22} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
