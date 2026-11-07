"use client";

import { useState, useEffect } from "react";
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

function fmt(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AssinarPage() {
  const params = useParams();
  const token = params.token as string;

  const [state, setState] = useState<"loading" | "ready" | "signed" | "error">("loading");
  const [training, setTraining] = useState<TrainingInfo | null>(null);
  const [signerName, setSignerName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pending, setPending] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then(async (res) => {
        const data = await res.json() as {
          error?: string;
          alreadySigned?: boolean;
          training?: TrainingInfo;
          signature?: { signerName: string };
        };
        if (!res.ok) {
          if (data.alreadySigned) { setState("signed"); return; }
          setErrorMsg(data.error ?? "Link inválido.");
          setState("error");
          return;
        }
        setTraining(data.training!);
        setSignerName(data.signature!.signerName);
        setState("ready");
      })
      .catch(() => { setErrorMsg("Erro ao carregar. Verifique sua conexão."); setState("error"); });
  }, [token]);

  async function handleSign() {
    if (!agreed) return;
    setPending(true);
    const res = await fetch(`/api/sign/${token}`, { method: "POST" });
    setPending(false);
    if (res.ok) { setState("signed"); return; }
    const data = await res.json() as { error?: string };
    setErrorMsg(data.error ?? "Erro ao confirmar assinatura.");
    setState("error");
  }

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
      <header style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center" }}>
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
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--tinta)", marginBottom: 8 }}>
                  Link inválido
                </h1>
                <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Already signed */}
          {state === "signed" && (
            <div style={cardStyle}>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>
                  ✓
                </div>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--tinta)", marginBottom: 8 }}>
                  Treinamento assinado
                </h1>
                <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 20 }}>
                  Sua assinatura foi registrada com sucesso.
                </p>
                {training && (
                  <Link
                    href={`/verificar/${training.verificationCode}`}
                    style={{ fontSize: 13, color: "var(--azul-eletrico)", fontWeight: 600 }}
                  >
                    Ver comprovante →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Ready to sign */}
          {state === "ready" && training && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header card */}
              <div style={{ ...cardStyle, textAlign: "center", paddingTop: 28 }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "var(--azul-eletrico)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Assinatura de treinamento
                </p>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--tinta)", margin: "0 0 4px" }}>
                  Olá, {signerName}
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>
                  Confirme sua participação no treinamento abaixo.
                </p>
              </div>

              {/* Training details */}
              <div style={cardStyle}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--tinta)", margin: "0 0 16px" }}>
                  Dados do treinamento
                </h2>

                {[
                  ["Tipo", training.trainingType],
                  ["Instrutor", training.instructor],
                  ["Empresa", training.company],
                  ["Cliente", training.clientCompany],
                  ["Início", fmt(training.startsAt)],
                  ["Término", fmt(training.endsAt)],
                ].map(([label, value], i, arr) => (
                  <div key={label} style={{ ...rowStyle, ...(i === arr.length - 1 ? { borderBottom: "none", marginBottom: 0, paddingBottom: 0 } : {}) }}>
                    <span style={{ fontSize: 13, color: "var(--muted-foreground)", flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", textAlign: "right" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Confirm */}
              <div style={cardStyle}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 20 }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "var(--azul-eletrico)", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.5 }}>
                    Confirmo que participei do treinamento <strong>{training.trainingType}</strong> ministrado por <strong>{training.instructor}</strong> no período indicado acima, e que as informações estão corretas.
                  </span>
                </label>

                <button
                  onClick={handleSign}
                  disabled={!agreed || pending}
                  className="cpv-btn cpv-btn--primary"
                  style={{ width: "100%", justifyContent: "center", opacity: !agreed ? 0.5 : 1 }}
                >
                  {pending ? "Confirmando…" : "Confirmar assinatura"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={{ padding: "16px 24px", textAlign: "center", fontSize: 12, color: "var(--muted-foreground)" }}>
        © {new Date().getFullYear()} Comproved · Plataforma de comprovação de treinamentos
      </footer>
    </div>
  );
}
