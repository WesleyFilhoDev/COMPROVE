"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { maskCpf } from "@/lib/format";

type TrainingType = { id: string; name: string; defaultDurationHours: number | null };

type ParticipantRow = { name: string; cpf: string; phone: string };

type Props = {
  companyName: string;
  trainingTypes: TrainingType[];
  instructorId: string;
};

function maskPhone(val: string): string {
  const d = val.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 11) return `+55${digits}`;
  if (digits.length === 10) return `+55${digits}`;
  return null;
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--foreground)",
  marginBottom: 6,
};

function BlockCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        padding: "24px 24px 20px",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--azul-eletrico)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {number}
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--tinta)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export function NovoTreinamentoClient({ companyName, trainingTypes, instructorId }: Props) {
  const router = useRouter();

  const [trainingTypeId, setTrainingTypeId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [contentMinistrado, setContentMinistrado] = useState("");
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [participants, setParticipants] = useState<ParticipantRow[]>([
    { name: "", cpf: "", phone: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 80);
  }, []);

  function setParticipant(idx: number, key: keyof ParticipantRow, val: string) {
    setParticipants((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: val } : p)));
  }

  function addParticipant() {
    setParticipants((prev) => [...prev, { name: "", cpf: "", phone: "" }]);
  }

  function removeParticipant(idx: number) {
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    setProgress({ done: 0, total: participants.length });

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const phone = toE164(p.phone);

      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingTypeId,
          instructorId,
          startsAt,
          endsAt,
          clientCompanyName,
          traineeName: p.name,
          traineeCpf: p.cpf.replace(/\D/g, ""),
          ...(phone ? { traineePhone: phone } : {}),
          ...(contentMinistrado.trim() ? { contentMinistrado: contentMinistrado.trim() } : {}),
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as {
          error: string | { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
        };
        let msg = `Erro ao emitir para ${p.name || `participante ${i + 1}`}.`;
        if (typeof json.error === "string") msg = json.error;
        else if (json.error?.fieldErrors) {
          const first = Object.values(json.error.fieldErrors).flat()[0];
          if (first) msg = first;
        }
        setPending(false);
        setProgress(null);
        setError(msg);
        return;
      }

      setProgress({ done: i + 1, total: participants.length });
    }

    setPending(false);
    router.push("/treinamentos");
  }

  const totalLabel =
    participants.length > 1
      ? `Gerar ${participants.length} comprovantes`
      : "Gerar comprovante";

  return (
    <div>
      {/* Top bar */}
      <div
        className="cpv-topbar"
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Link href="/dashboard" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}>
            {companyName}
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <Link href="/treinamentos" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}>
            Treinamentos
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ color: "var(--azul-eletrico)", fontWeight: 700 }}>Novo</span>
        </div>
        <Link
          href="/treinamentos"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--muted-foreground)",
            textDecoration: "none",
          }}
        >
          <ArrowLeftIcon />
          Voltar
        </Link>
      </div>

      {/* Page content */}
      <div className="cpv-page" style={{ maxWidth: 680 }}>
        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 24,
              color: "var(--tinta)",
              margin: "0 0 4px",
            }}
          >
            Novo treinamento
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>
            Preencha os dados para gerar o comprovante.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Block 1 — Treinamento */}
          <BlockCard number={1} title="Treinamento">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label htmlFor="nt-type" style={labelStyle}>
                  Tipo de treinamento <span style={{ color: "var(--destructive)" }}>*</span>
                </label>
                <select
                  id="nt-type"
                  ref={firstRef}
                  required
                  value={trainingTypeId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setTrainingTypeId(id);
                    if (id && startsAt) {
                      const type = trainingTypes.find((tt) => tt.id === id);
                      if (type?.defaultDurationHours) {
                        const start = new Date(startsAt);
                        const end = new Date(start.getTime() + type.defaultDurationHours * 3600_000);
                        const pad = (n: number) => String(n).padStart(2, "0");
                        setEndsAt(
                          `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`
                        );
                      }
                    }
                  }}
                  style={inputStyle}
                >
                  <option value="">Selecione o tipo…</option>
                  {trainingTypes.map((tt) => (
                    <option key={tt.id} value={tt.id}>
                      {tt.name}
                    </option>
                  ))}
                </select>
                {trainingTypes.length === 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--warning)" }}>
                    Nenhum tipo de treinamento cadastrado.{" "}
                    <Link href="/tipos-de-treinamento" style={{ color: "var(--azul-eletrico)" }}>
                      Criar agora
                    </Link>
                  </p>
                )}
              </div>
              <div className="cpv-form-2col">
                <div>
                  <label htmlFor="nt-starts" style={labelStyle}>
                    Início <span style={{ color: "var(--destructive)" }}>*</span>
                  </label>
                  <input
                    id="nt-starts"
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStartsAt(val);
                      if (val && trainingTypeId) {
                        const type = trainingTypes.find((tt) => tt.id === trainingTypeId);
                        if (type?.defaultDurationHours) {
                          const start = new Date(val);
                          const end = new Date(start.getTime() + type.defaultDurationHours * 3600_000);
                          const pad = (n: number) => String(n).padStart(2, "0");
                          setEndsAt(
                            `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`
                          );
                        }
                      }
                    }}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="nt-ends" style={labelStyle}>
                    Término <span style={{ color: "var(--destructive)" }}>*</span>
                  </label>
                  <input
                    id="nt-ends"
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </BlockCard>

          {/* Block 2 — Conteúdo ministrado */}
          <BlockCard number={2} title="Conteúdo ministrado">
            <div>
              <label htmlFor="nt-content" style={labelStyle}>
                Descreva o conteúdo abordado no treinamento
              </label>
              <textarea
                id="nt-content"
                rows={4}
                value={contentMinistrado}
                onChange={(e) => setContentMinistrado(e.target.value)}
                placeholder="Ex: Normas de segurança NR-35, trabalho em altura, uso de EPI…"
                style={{
                  ...inputStyle,
                  height: "auto",
                  padding: "10px 12px",
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
              />
            </div>
          </BlockCard>

          {/* Block 3 — Participantes */}
          <BlockCard number={3} title="Participantes">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--nevoa)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "14px 14px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted-foreground)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Participante {participants.length > 1 ? idx + 1 : ""}
                    </span>
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(idx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--destructive)",
                          fontSize: 12,
                          fontWeight: 500,
                          padding: 0,
                        }}
                      >
                        <TrashIcon />
                        Remover
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo *"
                      value={p.name}
                      onChange={(e) => setParticipant(idx, "name", e.target.value)}
                      style={inputStyle}
                    />
                    <div className="cpv-form-2col" style={{ gap: 8 }}>
                      <input
                        type="text"
                        required
                        placeholder="CPF *  000.000.000-00"
                        maxLength={14}
                        value={p.cpf}
                        onChange={(e) => setParticipant(idx, "cpf", maskCpf(e.target.value))}
                        style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: 13 }}
                      />
                      <input
                        type="tel"
                        placeholder="WhatsApp  (11) 9 1234-5678"
                        maxLength={16}
                        value={p.phone}
                        onChange={(e) => setParticipant(idx, "phone", maskPhone(e.target.value))}
                        style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: 13 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addParticipant}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "1px dashed var(--border)",
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--azul-eletrico)",
                  padding: "10px 14px",
                  width: "100%",
                  justifyContent: "center",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--azul-gelo)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <PlusIcon />
                Adicionar participante
              </button>
            </div>
          </BlockCard>

          {/* Block 4 — Empresa contratante */}
          <BlockCard number={4} title="Empresa contratante">
            <div>
              <label htmlFor="nt-client" style={labelStyle}>
                Nome da empresa contratante <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <input
                id="nt-client"
                type="text"
                required
                value={clientCompanyName}
                onChange={(e) => setClientCompanyName(e.target.value)}
                placeholder="Ex: Construtora Exemplo S.A."
                style={inputStyle}
              />
            </div>
          </BlockCard>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "var(--destructive-soft)",
                border: "1px solid var(--destructive-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                color: "var(--destructive)",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <div style={{ paddingBottom: 8 }}>
            <button
              type="submit"
              disabled={pending}
              className="cpv-btn cpv-btn--primary"
              style={{
                width: "100%",
                height: 48,
                fontSize: 15,
                fontWeight: 700,
                justifyContent: "center",
                opacity: pending ? 0.7 : 1,
              }}
            >
              {progress
                ? `Emitindo ${progress.done}/${progress.total}…`
                : totalLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
