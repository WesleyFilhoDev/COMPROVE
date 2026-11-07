"use client";

import { useEffect, useRef } from "react";

type Variant = "danger" | "warning" | "info";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantConfig: Record<Variant, { confirmBg: string; confirmColor: string; iconBg: string; iconColor: string; icon: React.ReactNode }> = {
  danger: {
    confirmBg: "var(--destructive)",
    confirmColor: "#fff",
    iconBg: "var(--destructive-soft)",
    iconColor: "var(--destructive)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 6v5M10 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8.68 3.26a1.5 1.5 0 0 1 2.64 0l6.5 11.25A1.5 1.5 0 0 1 16.5 17h-13a1.5 1.5 0 0 1-1.32-2.49L8.68 3.26Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  warning: {
    confirmBg: "var(--warning, #f59e0b)",
    confirmColor: "#fff",
    iconBg: "var(--warning-soft, #fef3c7)",
    iconColor: "var(--warning, #f59e0b)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v5M10 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  info: {
    confirmBg: "var(--azul-eletrico)",
    confirmColor: "#fff",
    iconBg: "var(--azul-gelo)",
    iconColor: "var(--azul-eletrico)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9v5M10 7h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  pending = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const cfg = variantConfig[variant];

  useEffect(() => {
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(15,26,46,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        style={{
          background: "var(--card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 24px 48px rgba(15,26,46,0.18)",
          width: "100%",
          maxWidth: 420,
          padding: 28,
        }}
      >
        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-lg)",
              background: cfg.iconBg,
              color: cfg.iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </div>
          <div>
            <h2
              id="confirm-title"
              style={{
                margin: "0 0 4px",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--tinta)",
                fontFamily: "var(--font-display)",
              }}
            >
              {title}
            </h2>
            <p id="confirm-desc" style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={pending}
            style={{
              height: 36,
              padding: "0 16px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              background: "var(--card)",
              color: "var(--foreground)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            style={{
              height: 36,
              padding: "0 16px",
              border: "none",
              borderRadius: "var(--radius-md)",
              background: cfg.confirmBg,
              color: cfg.confirmColor,
              fontSize: 13,
              fontWeight: 600,
              cursor: pending ? "not-allowed" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? "Aguarde…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
