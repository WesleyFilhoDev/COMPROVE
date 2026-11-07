"use client";

import { useState } from "react";

export type PendingTraining = {
  id: string;
  verificationCode: string;
  trainingTypeName: string;
  clientCompanyName: string;
  traineeName: string;
  startsAt: string;
};

function PenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11 2l3 3L5 14H2v-3L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function InstructorPendingSignatures({ trainings }: { trainings: PendingTraining[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSign(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/trainings/${id}/sign-token?role=INSTRUCTOR`);
      if (res.ok) {
        const data = (await res.json()) as { signToken: string };
        window.open(`/assinar/${data.signToken}`, "_blank");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {trainings.map((t) => {
        const date = new Date(t.startsAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const time = new Date(t.startsAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const isLoading = loading === t.id;

        return (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              background: "var(--nevoa)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.trainingTypeName}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                {t.clientCompanyName} · {t.traineeName} · {date} {time}
              </div>
            </div>
            <button
              onClick={() => handleSign(t.id)}
              disabled={isLoading}
              className="cpv-btn cpv-btn--primary cpv-btn--sm"
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, opacity: isLoading ? 0.6 : 1 }}
            >
              <PenIcon />
              {isLoading ? "Abrindo…" : "Assinar agora"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
