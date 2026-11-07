"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type SigInfo = {
  status: string;
  signerName: string;
  signedAt: string | null;
  signToken: string | null;
};

type TrainingData = {
  id: string;
  status: string;
  verificationCode: string;
  startsAt: string;
  endsAt: string;
  durationLabel: string;
  traineeName: string;
  traineeCpf: string;
  traineePhone: string | null;
  clientCompanyName: string;
  contentMinistrado: string | null;
  canceledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  instructor: { id: string; name: string; jobTitle: string | null };
  trainingType: { id: string; name: string };
  canceledBy: { id: string; name: string } | null;
};

type Props = {
  companyName: string;
  isAdmin: boolean;
  currentUserId: string;
  training: TrainingData;
  instructorSig: SigInfo | null;
  traineeSig: SigInfo | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDateRange(startsAt: string, endsAt: string) {
  const sd = fmtDate(startsAt);
  const ed = fmtDate(endsAt);
  const st = new Date(startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const et = new Date(endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (sd === ed) return `${sd}  ${st} – ${et}`;
  return `${sd} – ${ed}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11 2l3 3L5 14H2v-3L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 2.5A6.9 6.9 0 0 0 8 0C3.58 0 0 3.58 0 8c0 1.41.37 2.75 1.01 3.91L0 16l4.19-1.1A7.93 7.93 0 0 0 8 16c4.42 0 8-3.58 8-8 0-2.14-.83-4.14-2.5-5.5ZM8 14.5a6.4 6.4 0 0 1-3.27-.9l-.23-.14-2.49.65.67-2.42-.16-.25A6.46 6.46 0 0 1 1.5 8c0-3.59 2.91-6.5 6.5-6.5S14.5 4.41 14.5 8 11.59 14.5 8 14.5Zm3.56-4.87c-.19-.1-1.14-.56-1.32-.63-.17-.06-.3-.1-.42.1-.13.19-.49.63-.6.75-.11.13-.22.14-.41.05-.19-.1-.8-.3-1.52-.95-.56-.5-.94-1.12-1.05-1.31-.11-.19-.01-.29.08-.38.09-.09.19-.23.29-.34.1-.12.13-.19.19-.32.07-.13.03-.24-.01-.34-.05-.1-.42-1.01-.58-1.38-.15-.36-.3-.31-.42-.32h-.36c-.12 0-.32.04-.49.24-.17.19-.64.63-.64 1.53s.66 1.77.75 1.9c.1.12 1.3 1.98 3.15 2.78.44.19.78.3 1.05.38.44.14.84.12 1.16.07.35-.05 1.09-.45 1.24-.88.15-.43.15-.8.1-.88-.04-.08-.17-.13-.36-.22Z" fill="currentColor" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Send Link Modal ──────────────────────────────────────────────────────────

function SendLinkModal({
  traineeName,
  traineePhone,
  trainingType,
  signToken,
  onClose,
}: {
  traineeName: string;
  traineePhone: string | null;
  trainingType: string;
  signToken: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const signUrl = `${origin}/assinar/${signToken}`;

  const waMsg = `Olá ${traineeName}! Você participou do treinamento *${trainingType}*. Acesse o link abaixo para assinar seu comprovante digitalmente:\n${signUrl}`;
  const waUrl = traineePhone
    ? `https://wa.me/${traineePhone.replace("+", "")}?text=${encodeURIComponent(waMsg)}`
    : `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

  function copy() {
    void navigator.clipboard.writeText(signUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,26,46,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", boxShadow: "0 24px 48px rgba(15,26,46,0.18)", width: "100%", maxWidth: 420, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--tinta)", margin: "0 0 2px" }}>
              Link de assinatura
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>{traineeName} · {trainingType}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--nevoa)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "7px 10px", marginBottom: 14 }}>
          <span style={{ flex: 1, fontSize: 11, color: "var(--azul-eletrico)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>{signUrl}</span>
          <button onClick={copy} style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: copied ? "var(--success)" : "var(--muted-foreground)", padding: 2, display: "flex" }}>
            {copied
              ? <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <CopyIcon />}
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copy} className="cpv-btn cpv-btn--primary cpv-btn--sm" style={{ flex: 1, justifyContent: "center" }}>
            {copied ? "✓ Copiado!" : "Copiar link"}
          </button>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="cpv-btn cpv-btn--outline cpv-btn--sm" style={{ flex: 1, justifyContent: "center", gap: 6, textDecoration: "none" }}>
            <WhatsAppIcon /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({
  trainingId,
  onClose,
  onCanceled,
}: {
  trainingId: string;
  onClose: () => void;
  onCanceled: () => void;
}) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setPending(true);
    const res = await fetch(`/api/trainings/${trainingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setPending(false);
    if (res.ok) { onCanceled(); return; }
    const json = (await res.json()) as { error?: string };
    setError(json.error ?? "Erro ao cancelar.");
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,26,46,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", boxShadow: "0 24px 48px rgba(15,26,46,0.18)", width: "100%", maxWidth: 440, padding: 28 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--tinta)", margin: "0 0 6px" }}>Cancelar treinamento</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--muted-foreground)" }}>Esta ação é irreversível. Informe o motivo do cancelamento.</p>
        <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Descreva o motivo com ao menos 10 caracteres…"
          style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--card)", color: "var(--foreground)", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }}
        />
        {error && <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--destructive)" }}>{error}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--muted-foreground)", padding: "0 12px", height: 36, borderRadius: "var(--radius-md)" }}>Voltar</button>
          <button type="button" disabled={pending || reason.length < 10} onClick={handleCancel}
            style={{ height: 36, padding: "0 16px", border: "none", borderRadius: "var(--radius-md)", background: "var(--destructive)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: reason.length < 10 ? "not-allowed" : "pointer", opacity: reason.length < 10 ? 0.5 : 1 }}>
            {pending ? "Cancelando…" : "Confirmar cancelamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Signature Card ───────────────────────────────────────────────────────────

function SigCard({
  role,
  sig,
  isCurrentUser,
  trainingId,
  traineeName,
  traineePhone,
  trainingType,
  trainingStatus,
}: {
  role: "INSTRUCTOR" | "TRAINEE";
  sig: SigInfo | null;
  isCurrentUser: boolean;
  trainingId: string;
  traineeName: string;
  traineePhone: string | null;
  trainingType: string;
  trainingStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const isSigned = sig?.status === "SIGNED";
  const isPending = !isSigned;
  const isIssued = trainingStatus === "ISSUED";

  async function handleInstructorSign() {
    setLoading(true);
    const res = await fetch(`/api/trainings/${trainingId}/sign-token?role=INSTRUCTOR`);
    setLoading(false);
    if (res.ok) {
      const data = (await res.json()) as { signToken: string };
      window.open(`/assinar/${data.signToken}`, "_blank");
    }
  }

  const roleLabel = role === "INSTRUCTOR" ? "Instrutor" : "Treinando";
  const name = sig?.signerName ?? (role === "TRAINEE" ? traineeName : "—");

  return (
    <>
      <div
        style={{
          background: "var(--card)",
          borderRadius: "var(--radius-xl)",
          border: `1px solid ${isSigned ? "var(--success-border)" : "var(--border)"}`,
          padding: "16px 20px",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {roleLabel}
          </span>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 600, borderRadius: "var(--radius-full)",
              border: "1px solid", padding: "2px 8px",
              color: isSigned ? "var(--success)" : "var(--warning)",
              background: isSigned ? "var(--success-soft)" : "var(--warning-soft)",
              borderColor: isSigned ? "var(--success-border)" : "var(--warning-border)",
            }}
          >
            {isSigned ? <CheckCircleIcon /> : <ClockIcon />}
            {isSigned ? "Assinado" : "Pendente"}
          </span>
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: isSigned ? 4 : 12 }}>
          {name}
        </div>

        {isSigned && sig?.signedAt && (
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>
            Assinado em {fmtDateTime(sig.signedAt)}
          </div>
        )}

        {isPending && isIssued && (
          <div style={{ display: "flex", gap: 8 }}>
            {role === "INSTRUCTOR" && isCurrentUser && (
              <button
                onClick={handleInstructorSign}
                disabled={loading}
                className="cpv-btn cpv-btn--primary cpv-btn--sm"
                style={{ display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.6 : 1 }}
              >
                <PenIcon />
                {loading ? "Abrindo…" : "Assinar agora"}
              </button>
            )}
            {role === "TRAINEE" && sig?.signToken && (
              <button
                onClick={() => setShowSendModal(true)}
                className="cpv-btn cpv-btn--outline cpv-btn--sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <WhatsAppIcon />
                Enviar link
              </button>
            )}
            {role === "INSTRUCTOR" && !isCurrentUser && (
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>
                Aguardando assinatura do instrutor
              </span>
            )}
          </div>
        )}
      </div>

      {showSendModal && sig?.signToken && (
        <SendLinkModal
          traineeName={traineeName}
          traineePhone={traineePhone}
          trainingType={trainingType}
          signToken={sig.signToken}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TrainamentoDetail({
  companyName,
  isAdmin,
  currentUserId,
  training,
  instructorSig,
  traineeSig,
}: Props) {
  const [showCancel, setShowCancel] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const isCanceled = canceled || training.status === "CANCELED";
  const isCurrentInstructor = training.instructor.id === currentUserId;

  const sigTotal = [instructorSig, traineeSig].filter(Boolean).length;
  const sigSigned = [instructorSig, traineeSig].filter((s) => s?.status === "SIGNED").length;
  const isFullySigned = !isCanceled && sigTotal > 0 && sigSigned === sigTotal;

  const statusLabel = isCanceled ? "Cancelado" : isFullySigned ? "Assinado" : "Pendente";
  const statusColor = isCanceled
    ? { color: "var(--destructive)", bg: "var(--destructive-soft)", border: "var(--destructive-border)" }
    : isFullySigned
      ? { color: "var(--success)", bg: "var(--success-soft)", border: "var(--success-border)" }
      : { color: "var(--warning)", bg: "var(--warning-soft)", border: "var(--warning-border)" };

  // Build timeline events
  const events: { label: string; date: string; color?: string }[] = [
    { label: "Treinamento emitido", date: training.createdAt },
  ];
  if (instructorSig?.status === "SIGNED" && instructorSig.signedAt) {
    events.push({ label: "Instrutor assinou", date: instructorSig.signedAt, color: "var(--success)" });
  }
  if (traineeSig?.status === "SIGNED" && traineeSig.signedAt) {
    events.push({ label: "Treinando assinou", date: traineeSig.signedAt, color: "var(--success)" });
  }
  if (isCanceled && training.canceledAt) {
    events.push({ label: "Treinamento cancelado", date: training.canceledAt, color: "var(--destructive)" });
  }

  return (
    <div>
      {/* Top bar */}
      <div
        className="cpv-topbar"
        style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Link href="/dashboard" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}>{companyName}</Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <Link href="/treinamentos" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}>Treinamentos</Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ color: "var(--azul-eletrico)", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12 }}>{training.verificationCode}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href={`/verificar/${training.verificationCode}`} target="_blank" className="cpv-btn cpv-btn--outline cpv-btn--sm" style={{ gap: 6 }}>
            Ver comprovante
          </Link>
          <a href={`/api/trainings/${training.id}/pdf`} download className="cpv-btn cpv-btn--outline cpv-btn--sm" style={{ gap: 6 }}>
            <DownloadIcon />
            PDF
          </a>
        </div>
      </div>

      {/* Page content */}
      <div className="cpv-page" style={{ maxWidth: 820 }}>

        {/* Header card */}
        <div style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", padding: "20px 24px", boxShadow: "var(--shadow-xs)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 11, fontWeight: 600, borderRadius: "var(--radius-full)",
                    border: "1px solid", padding: "3px 10px", whiteSpace: "nowrap",
                    color: statusColor.color, background: statusColor.bg, borderColor: statusColor.border,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor", flexShrink: 0 }} />
                  {statusLabel}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--azul-eletrico)" }}>
                  {training.verificationCode}
                </span>
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--tinta)", margin: "0 0 6px", lineHeight: 1.2 }}>
                {training.trainingType.name}
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>
                {fmtDateRange(training.startsAt, training.endsAt)}
                {" · "}
                {training.durationLabel}
                {" · "}
                {training.clientCompanyName}
              </p>
            </div>
            {isAdmin && !isCanceled && (
              <button
                onClick={() => setShowCancel(true)}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "var(--destructive)", flexShrink: 0 }}
              >
                Cancelar
              </button>
            )}
          </div>

          {isCanceled && training.cancelReason && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--destructive-soft)", border: "1px solid var(--destructive-border)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--destructive)" }}>
              <strong>Motivo do cancelamento:</strong> {training.cancelReason}
              {training.canceledBy && (
                <span style={{ color: "var(--muted-foreground)", marginLeft: 8 }}>— {training.canceledBy.name}</span>
              )}
            </div>
          )}
        </div>

        {/* Two-column: Details + Signatures */}
        <div className="cpv-2col" style={{ marginBottom: 20, alignItems: "start" }}>

          {/* Details */}
          <div style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", padding: "20px 24px", boxShadow: "var(--shadow-xs)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--tinta)", margin: "0 0 16px" }}>Detalhes</h2>

            {[
              ["Instrutor", training.instructor.name + (training.instructor.jobTitle ? ` · ${training.instructor.jobTitle}` : "")],
              ["Treinando", `${training.traineeName} · ${training.traineeCpf}`],
              ["Empresa cliente", training.clientCompanyName],
              ...(training.traineePhone ? [["WhatsApp", training.traineePhone]] : []),
            ].map(([label, value], i, arr) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0, borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                <span style={{ fontSize: 13, color: "var(--foreground)", textAlign: "right" }}>{value}</span>
              </div>
            ))}

            {training.contentMinistrado && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Conteúdo ministrado</div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--foreground)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{training.contentMinistrado}</p>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--tinta)", margin: "0 0 4px" }}>Assinaturas</h2>
            <SigCard
              role="INSTRUCTOR"
              sig={instructorSig}
              isCurrentUser={isCurrentInstructor}
              trainingId={training.id}
              traineeName={training.traineeName}
              traineePhone={training.traineePhone}
              trainingType={training.trainingType.name}
              trainingStatus={isCanceled ? "CANCELED" : training.status}
            />
            <SigCard
              role="TRAINEE"
              sig={traineeSig}
              isCurrentUser={false}
              trainingId={training.id}
              traineeName={training.traineeName}
              traineePhone={training.traineePhone}
              trainingType={training.trainingType.name}
              trainingStatus={isCanceled ? "CANCELED" : training.status}
            />
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", padding: "20px 24px", boxShadow: "var(--shadow-xs)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--tinta)", margin: "0 0 16px" }}>Histórico</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                {/* Dot + line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: ev.color ?? "var(--azul-eletrico)", marginTop: 4, flexShrink: 0 }} />
                  {i < events.length - 1 && (
                    <div style={{ width: 1, background: "var(--border)", flex: 1, minHeight: 24, marginTop: 2 }} />
                  )}
                </div>
                {/* Text */}
                <div style={{ paddingBottom: i < events.length - 1 ? 16 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: ev.color ?? "var(--foreground)" }}>{ev.label}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{fmtDateTime(ev.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Cancel modal */}
      {showCancel && (
        <CancelModal
          trainingId={training.id}
          onClose={() => setShowCancel(false)}
          onCanceled={() => { setShowCancel(false); setCanceled(true); }}
        />
      )}
    </div>
  );
}
