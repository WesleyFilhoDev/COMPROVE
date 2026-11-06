"use client";

import { useState } from "react";

export function VerifyDemo() {
  const [verified, setVerified] = useState(false);

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
        <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="lp-codigo"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}
          >
            Código do comprovante
          </label>
          <input
            id="lp-codigo"
            type="text"
            readOnly
            defaultValue="CPV-2026-000184"
            style={{
              height: "var(--control-md)",
              padding: "0 12px",
              border: "1px solid var(--input)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              background: "var(--card)",
              color: "var(--foreground)",
              outline: "none",
            }}
          />
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Está no rodapé do PDF, ao lado do QR Code.
          </span>
        </div>
        <button
          type="button"
          className="cpv-btn cpv-btn--outline"
          style={{ marginBottom: 22 }}
          onClick={() => setVerified(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Verificar comprovante
        </button>
      </div>

      {verified ? (
        <div role="status" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <span className="cpv-badge cpv-badge--assinado">Documento encontrado</span>
            <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              Módulo de Estoque — Turma B · Distribuidora Aurora
            </span>
          </div>
          <VerificationSeal
            code="CPV-2026-000184"
            issuedAt="05/11/2026 às 10:14"
            signatures="3 de 3 assinaturas coletadas"
          />
        </div>
      ) : (
        <div
          style={{
            padding: 24,
            border: "1px dashed var(--graphite-400)",
            borderRadius: "var(--radius-xl)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "var(--muted-foreground)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          Clique em Verificar comprovante para ver o resultado.
        </div>
      )}
    </div>
  );
}

function VerificationSeal({ code, issuedAt, signatures }: { code: string; issuedAt: string; signatures: string }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        border: "1px solid var(--success-border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--success-soft)",
        display: "flex",
        flexWrap: "wrap",
        gap: "12px 24px",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-full)",
            background: "var(--success)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--success)" }}>DOCUMENTO VÁLIDO</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--success)" }}>{code}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 12, color: "var(--success)" }}>{issuedAt}</span>
        <span style={{ fontSize: 12, color: "var(--success)" }}>{signatures}</span>
      </div>
    </div>
  );
}
