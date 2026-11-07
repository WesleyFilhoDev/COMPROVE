"use client";

import { useState } from "react";
import { maskPhone } from "@/lib/format";

type PendingInvite = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  pendingInvites: PendingInvite[];
};

export function DashboardClient({ pendingInvites }: Props) {
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resent, setResent] = useState<Set<string>>(new Set());

  async function handleResend(inviteId: string, phone: string) {
    setResendingId(inviteId);
    try {
      const res = await fetch(`/api/invitations/${inviteId}/resend`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const url = data.inviteUrl as string;
        const waUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Você foi convidado para a plataforma Comproved. Acesse: ${url}`)}`;
        window.open(waUrl, "_blank");
        setResent((prev) => new Set(prev).add(inviteId));
      }
    } catch {
      // silent
    } finally {
      setResendingId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {pendingInvites.map((inv) => {
        const wasResent = resent.has(inv.id);
        const createdAt = new Date(inv.createdAt);
        const dateStr = createdAt.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });

        return (
          <div
            key={inv.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              className="cpv-avatar"
              style={{
                width: 32,
                height: 32,
                fontSize: 11,
                background: "var(--azul-gelo)",
                color: "var(--azul-eletrico)",
                flexShrink: 0,
              }}
            >
              {getInitials(inv.name)}
            </span>
            <div style={{ flex: 1, overflow: "hidden" }}>
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
                {inv.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                {maskPhone(inv.phone)} · {dateStr}
              </div>
            </div>
            <button
              onClick={() => handleResend(inv.id, inv.phone)}
              disabled={resendingId === inv.id}
              className="cpv-btn cpv-btn--outline cpv-btn--sm"
              style={{
                fontSize: 11,
                height: 28,
                padding: "0 10px",
                flexShrink: 0,
                opacity: wasResent ? 0.6 : 1,
              }}
            >
              {resendingId === inv.id ? "..." : wasResent ? "Enviado" : "Reenviar"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
