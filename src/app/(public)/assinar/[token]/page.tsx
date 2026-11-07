"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";

type TrainingInfo = {
  traineeName: string;
  trainingType: string;
  instructor: string;
  company: string;
  clientCompany: string;
  startsAt: string;
  endsAt: string;
  verificationCode: string;
};

type SignerRole = "INSTRUCTOR" | "TRAINEE";

type TraineeInfo = {
  name: string;
  phone: string | null;
  signToken: string | null;
  alreadySigned: boolean;
  trainingType: string;
  verificationCode: string;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── WhatsApp Delivery Card ───────────────────────────────────────────────────

function WhatsAppDeliveryCard({
  trainee,
  origin,
}: {
  trainee: TraineeInfo;
  origin: string;
}) {
  const [copied, setCopied] = useState(false);

  const signUrl = trainee.signToken ? `${origin}/assinar/${trainee.signToken}` : null;

  const waMessage = `Olá ${trainee.name}! Você participou do treinamento *${trainee.trainingType}*. Acesse o link abaixo para assinar seu comprovante digitalmente:\n${signUrl}`;
  const waUrl = trainee.phone
    ? `https://wa.me/${trainee.phone.replace("+", "")}?text=${encodeURIComponent(waMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  function copyLink() {
    if (!signUrl) return;
    void navigator.clipboard.writeText(signUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        padding: 24,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 15,
          color: "var(--tinta)",
          margin: "0 0 4px",
        }}
      >
        Enviar para participante
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted-foreground)" }}>
        Compartilhe o link de assinatura com <strong>{trainee.name}</strong>.
      </p>

      {/* Participant row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "var(--nevoa)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--azul-gelo)",
            color: "var(--azul-eletrico)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {trainee.name.charAt(0).toUpperCase()}
        </div>
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
            {trainee.name}
          </div>
          {trainee.phone ? (
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{trainee.phone}</div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--warning)" }}>Sem telefone cadastrado</div>
          )}
        </div>
      </div>

      {/* Link preview */}
      {signUrl && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--nevoa)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "7px 10px",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 11,
              color: "var(--azul-eletrico)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-mono)",
            }}
          >
            {signUrl}
          </span>
          <button
            onClick={copyLink}
            title="Copiar"
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: copied ? "var(--success)" : "var(--muted-foreground)",
              padding: 2,
              display: "flex",
            }}
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )}
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cpv-btn cpv-btn--primary"
          style={{
            flex: 1,
            justifyContent: "center",
            gap: 8,
            textDecoration: "none",
            background: "#25D366",
            borderColor: "#25D366",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13.5 2.5A6.9 6.9 0 0 0 8 0C3.58 0 0 3.58 0 8c0 1.41.37 2.75 1.01 3.91L0 16l4.19-1.1A7.93 7.93 0 0 0 8 16c4.42 0 8-3.58 8-8 0-2.14-.83-4.14-2.5-5.5ZM8 14.5a6.4 6.4 0 0 1-3.27-.9l-.23-.14-2.49.65.67-2.42-.16-.25A6.46 6.46 0 0 1 1.5 8c0-3.59 2.91-6.5 6.5-6.5S14.5 4.41 14.5 8 11.59 14.5 8 14.5Zm3.56-4.87c-.19-.1-1.14-.56-1.32-.63-.17-.06-.3-.1-.42.1-.13.19-.49.63-.6.75-.11.13-.22.14-.41.05-.19-.1-.8-.3-1.52-.95-.56-.5-.94-1.12-1.05-1.31-.11-.19-.01-.29.08-.38.09-.09.19-.23.29-.34.1-.12.13-.19.19-.32.07-.13.03-.24-.01-.34-.05-.1-.42-1.01-.58-1.38-.15-.36-.3-.31-.42-.32h-.36c-.12 0-.32.04-.49.24-.17.19-.64.63-.64 1.53s.66 1.77.75 1.9c.1.12 1.3 1.98 3.15 2.78.44.19.78.3 1.05.38.44.14.84.12 1.16.07.35-.05 1.09-.45 1.24-.88.15-.43.15-.8.1-.88-.04-.08-.17-.13-.36-.22Z" fill="currentColor"/>
          </svg>
          {trainee.phone ? "Enviar pelo WhatsApp" : "Abrir WhatsApp"}
        </a>
        {signUrl && (
          <button
            onClick={copyLink}
            className="cpv-btn cpv-btn--outline"
            style={{ flexShrink: 0, paddingLeft: 16, paddingRight: 16 }}
          >
            {copied ? "✓ Copiado" : "Copiar link"}
          </button>
        )}
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Link
          href={`/verificar/${trainee.verificationCode}`}
          style={{ fontSize: 13, color: "var(--azul-eletrico)", fontWeight: 600 }}
        >
          Ver comprovante →
        </Link>
      </div>
    </div>
  );
}

// ─── Signature Canvas ─────────────────────────────────────────────────────────

function SignatureCanvas({
  onImageChange,
}: {
  onImageChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  function getPos(
    e: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement,
  ): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const pos = getPos(e.nativeEvent, canvas);
    lastPos.current = pos;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "#0f1a2e";
    ctx.fill();
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e.nativeEvent, canvas);
    if (!lastPos.current) { lastPos.current = pos; return; }
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0f1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    if (isEmpty) {
      setIsEmpty(false);
      onImageChange(canvas.toDataURL("image/png"));
    }
  }

  function stopDraw() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      onImageChange(canvas.toDataURL("image/png"));
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onImageChange(null);
  }

  return (
    <div>
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-lg)",
          border: `2px ${isEmpty ? "dashed" : "solid"} var(--border)`,
          background: "#fff",
          overflow: "hidden",
          transition: "border-color 0.15s",
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          style={{
            width: "100%",
            height: 160,
            display: "block",
            cursor: "crosshair",
            touchAction: "none",
            userSelect: "none",
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {isEmpty && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              gap: 6,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "#c8d0dc" }}>
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 13, color: "#c8d0dc", fontWeight: 500 }}>
              Assine aqui com o dedo ou mouse
            </span>
          </div>
        )}
      </div>
      {!isEmpty && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button
            type="button"
            onClick={clearCanvas}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Limpar e refazer
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AssinarPage() {
  const params = useParams();
  const token = params.token as string;

  const [state, setState] = useState<"loading" | "ready" | "signed" | "error">("loading");
  const [training, setTraining] = useState<TrainingInfo | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerRole, setSignerRole] = useState<SignerRole>("TRAINEE");
  const [errorMsg, setErrorMsg] = useState("");
  const [pending, setPending] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [traineeInfo, setTraineeInfo] = useState<TraineeInfo | null>(null);

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          error?: string;
          alreadySigned?: boolean;
          training?: TrainingInfo;
          signature?: { signerName: string; signerRole: SignerRole };
        };
        if (!res.ok) {
          if (data.alreadySigned) { setState("signed"); return; }
          setErrorMsg(data.error ?? "Link inválido.");
          setState("error");
          return;
        }
        setTraining(data.training!);
        setSignerName(data.signature!.signerName);
        setSignerRole(data.signature!.signerRole ?? "TRAINEE");
        setState("ready");
      })
      .catch(() => {
        setErrorMsg("Erro ao carregar. Verifique sua conexão.");
        setState("error");
      });
  }, [token]);

  async function handleSign() {
    if (!agreed || !signatureImage) return;
    setPending(true);
    const res = await fetch(`/api/sign/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureImage }),
    });
    setPending(false);
    if (res.ok) {
      const data = (await res.json()) as {
        ok: boolean;
        signerRole?: SignerRole;
        trainee?: TraineeInfo;
      };
      if (data.signerRole === "INSTRUCTOR" && data.trainee) {
        setTraineeInfo(data.trainee);
      }
      setState("signed");
      return;
    }
    const data = (await res.json()) as { error?: string };
    setErrorMsg(data.error ?? "Erro ao confirmar assinatura.");
    setState("error");
  }

  const canSubmit = agreed && !!signatureImage && !pending;

  const cardStyle: React.CSSProperties = {
    background: "var(--card)",
    borderRadius: "var(--radius-xl)",
    border: "1px solid var(--border)",
    padding: 24,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottom: "1px solid var(--border)",
    fontSize: 14,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--nevoa)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size={28} tone="positive" variant="horizontal" />
        </Link>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Loading */}
          {state === "loading" && (
            <div style={{ textAlign: "center", color: "var(--muted-foreground)", fontSize: 14 }}>
              Carregando…
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div style={cardStyle}>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 20,
                    color: "var(--tinta)",
                    marginBottom: 8,
                  }}
                >
                  Link inválido
                </h1>
                <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Already signed */}
          {state === "signed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Success card */}
              <div style={cardStyle}>
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "var(--success-soft)",
                      color: "var(--success)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: 26,
                    }}
                  >
                    ✓
                  </div>
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 22,
                      color: "var(--tinta)",
                      marginBottom: 8,
                    }}
                  >
                    Assinatura registrada!
                  </h1>
                  <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 0 }}>
                    {traineeInfo
                      ? "Agora envie o link de assinatura para o participante."
                      : "Sua assinatura foi registrada com sucesso."}
                  </p>
                </div>
              </div>

              {/* WhatsApp delivery card — shown only when instructor signed and trainee hasn't signed yet */}
              {traineeInfo && !traineeInfo.alreadySigned && (
                <WhatsAppDeliveryCard
                  trainee={traineeInfo}
                  origin={typeof window !== "undefined" ? window.location.origin : ""}
                />
              )}

              {/* Already signed by trainee */}
              {traineeInfo?.alreadySigned && (
                <div style={{ ...cardStyle, textAlign: "center" }}>
                  <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted-foreground)" }}>
                    O participante <strong>{traineeInfo.name}</strong> já assinou este comprovante.
                  </p>
                  <Link
                    href={`/verificar/${traineeInfo.verificationCode}`}
                    style={{ fontSize: 13, color: "var(--azul-eletrico)", fontWeight: 600 }}
                  >
                    Ver comprovante →
                  </Link>
                </div>
              )}

              {/* View certificate */}
              {!traineeInfo && (training || traineeInfo) && (
                <div style={{ textAlign: "center" }}>
                  <Link
                    href={`/verificar/${(training ?? traineeInfo)?.verificationCode}`}
                    style={{ fontSize: 13, color: "var(--azul-eletrico)", fontWeight: 600 }}
                  >
                    Ver comprovante →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Ready to sign */}
          {state === "ready" && training && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header card */}
              <div style={{ ...cardStyle, textAlign: "center", paddingTop: 28 }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--azul-eletrico)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {signerRole === "INSTRUCTOR" ? "Assinatura do instrutor" : "Assinatura de treinamento"}
                </p>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--tinta)",
                    margin: "0 0 4px",
                  }}
                >
                  Olá, {signerName}
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>
                  {signerRole === "INSTRUCTOR"
                    ? "Confirme que você ministrou o treinamento abaixo."
                    : "Confirme sua participação no treinamento abaixo."}
                </p>
              </div>

              {/* Training details */}
              <div style={cardStyle}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--tinta)",
                    margin: "0 0 16px",
                  }}
                >
                  Dados do treinamento
                </h2>

                {(signerRole === "INSTRUCTOR"
                  ? [
                      ["Tipo", training.trainingType],
                      ["Treinando", training.traineeName],
                      ["Empresa", training.company],
                      ["Cliente", training.clientCompany],
                      ["Início", fmt(training.startsAt)],
                      ["Término", fmt(training.endsAt)],
                    ]
                  : [
                      ["Tipo", training.trainingType],
                      ["Instrutor", training.instructor],
                      ["Empresa", training.company],
                      ["Cliente", training.clientCompany],
                      ["Início", fmt(training.startsAt)],
                      ["Término", fmt(training.endsAt)],
                    ]
                ).map(([label, value], i, arr) => (
                  <div
                    key={label}
                    style={{
                      ...rowStyle,
                      ...(i === arr.length - 1
                        ? { borderBottom: "none", marginBottom: 0, paddingBottom: 0 }
                        : {}),
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--muted-foreground)", flexShrink: 0 }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", textAlign: "right" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Signature canvas */}
              <div style={cardStyle}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--tinta)",
                    margin: "0 0 4px",
                  }}
                >
                  Sua assinatura
                </h2>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--muted-foreground)" }}>
                  Desenhe sua assinatura manuscrita abaixo.
                </p>
                <SignatureCanvas onImageChange={setSignatureImage} />
                {!signatureImage && (
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--warning)", fontWeight: 500 }}>
                    Sua assinatura é obrigatória para confirmar.
                  </p>
                )}
              </div>

              {/* Confirm */}
              <div style={cardStyle}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    cursor: "pointer",
                    marginBottom: 20,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "var(--azul-eletrico)", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.5 }}>
                    {signerRole === "INSTRUCTOR" ? (
                      <>
                        Confirmo que ministrei o treinamento{" "}
                        <strong>{training.trainingType}</strong> para{" "}
                        <strong>{training.traineeName}</strong> no período indicado acima, e que as
                        informações estão corretas.
                      </>
                    ) : (
                      <>
                        Confirmo que participei do treinamento{" "}
                        <strong>{training.trainingType}</strong> ministrado por{" "}
                        <strong>{training.instructor}</strong> no período indicado acima, e que as
                        informações estão corretas.
                      </>
                    )}
                  </span>
                </label>

                <button
                  onClick={handleSign}
                  disabled={!canSubmit}
                  className="cpv-btn cpv-btn--primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    opacity: !canSubmit ? 0.45 : 1,
                    cursor: !canSubmit ? "not-allowed" : "pointer",
                  }}
                >
                  {pending ? "Confirmando…" : "Confirmar assinatura"}
                </button>

                {!signatureImage && agreed && (
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--warning)", textAlign: "center" }}>
                    Adicione sua assinatura antes de confirmar.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer
        style={{
          padding: "16px 24px",
          textAlign: "center",
          fontSize: 12,
          color: "var(--muted-foreground)",
        }}
      >
        © {new Date().getFullYear()} Comproved · Plataforma de comprovação de treinamentos
      </footer>
    </div>
  );
}
