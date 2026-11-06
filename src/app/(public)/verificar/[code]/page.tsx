import { findTrainingByCode } from "@/server/models/training";
import { Logo } from "@/components/logo";

type Props = {
  params: Promise<{ code: string }>;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function maskCpfStatic(_cpf: string): string {
  return "***.***.***-**";
}

function maskCnpjDisplay(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "");
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default async function VerificarPage({ params }: Props) {
  const { code } = await params;
  const training = await findTrainingByCode(code.toUpperCase());

  const isValid = training !== null;
  const isCanceled = training?.status === "CANCELED";

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--nevoa)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-8 space-y-8"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div className="flex justify-center">
          <Logo size={32} tone="positive" />
        </div>

        {!isValid ? (
          /* ── Not found ── */
          <div className="text-center space-y-4">
            {/* Red X seal */}
            <div className="flex justify-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                style={{
                  borderColor: "var(--destructive)",
                  background: "var(--destructive-soft)",
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--destructive)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>

            <h1
              className="text-xl font-extrabold"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Código não encontrado
            </h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              O código{" "}
              <span
                className="font-semibold"
                style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}
              >
                {code.toUpperCase()}
              </span>{" "}
              não corresponde a nenhum treinamento emitido pela Comproved.
            </p>
          </div>
        ) : (
          /* ── Found ── */
          <div className="space-y-6">
            {/* Seal */}
            <div className="flex justify-center">
              {!isCanceled ? (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                  style={{
                    borderColor: "var(--success-border)",
                    background: "var(--success-soft)",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                  style={{
                    borderColor: "var(--destructive-border)",
                    background: "var(--destructive-soft)",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--destructive)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              )}
            </div>

            {/* Status label */}
            <div className="text-center space-y-1">
              <p
                className="text-2xl font-extrabold tracking-widest"
                style={{
                  fontFamily: "var(--font-display)",
                  color: isCanceled ? "var(--destructive)" : "var(--success)",
                }}
              >
                {isCanceled ? "CANCELADO" : "VÁLIDO"}
              </p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Certificado de treinamento
              </p>
            </div>

            {/* Verification code */}
            <div
              className="text-center rounded-lg py-3 px-4 border"
              style={{ background: "var(--nevoa)", borderColor: "var(--border)" }}
            >
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>
                Código de verificação
              </p>
              <p
                className="text-lg font-bold tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--tinta)" }}
              >
                {training.verificationCode}
              </p>
            </div>

            {/* Details grid */}
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt style={{ color: "var(--muted-foreground)" }}>Treinamento</dt>
                <dd className="font-medium text-right" style={{ color: "var(--foreground)" }}>
                  {training.trainingTypeNameSnapshot}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: "var(--muted-foreground)" }}>Treinando</dt>
                <dd className="font-medium text-right" style={{ color: "var(--foreground)" }}>
                  {training.traineeName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: "var(--muted-foreground)" }}>CPF</dt>
                <dd
                  className="font-medium text-right"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}
                >
                  {maskCpfStatic(training.traineeCpf)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: "var(--muted-foreground)" }}>Empresa cliente</dt>
                <dd className="font-medium text-right" style={{ color: "var(--foreground)" }}>
                  {training.clientCompanyName}
                </dd>
              </div>
              <div
                className="border-t pt-3"
                style={{ borderColor: "var(--border)" }}
              />
              <div className="flex justify-between gap-4">
                <dt style={{ color: "var(--muted-foreground)" }}>Instrutor</dt>
                <dd className="font-medium text-right" style={{ color: "var(--foreground)" }}>
                  {training.instructorNameSnapshot}
                  {training.instructorJobTitleSnapshot
                    ? ` — ${training.instructorJobTitleSnapshot}`
                    : ""}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: "var(--muted-foreground)" }}>Emissor</dt>
                <dd className="font-medium text-right" style={{ color: "var(--foreground)" }}>
                  {training.companyNameSnapshot}
                  <span
                    className="block text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
                  >
                    CNPJ: {maskCnpjDisplay(training.companyCnpjSnapshot)}
                  </span>
                </dd>
              </div>
              <div
                className="border-t pt-3"
                style={{ borderColor: "var(--border)" }}
              />
              <div className="flex justify-between gap-4">
                <dt style={{ color: "var(--muted-foreground)" }}>Início</dt>
                <dd className="font-medium text-right" style={{ color: "var(--foreground)" }}>
                  {formatDate(training.startsAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: "var(--muted-foreground)" }}>Término</dt>
                <dd className="font-medium text-right" style={{ color: "var(--foreground)" }}>
                  {formatDate(training.endsAt)}
                </dd>
              </div>

              {isCanceled && training.canceledAt && (
                <>
                  <div
                    className="border-t pt-3"
                    style={{ borderColor: "var(--destructive-border)" }}
                  />
                  <div className="flex justify-between gap-4">
                    <dt style={{ color: "var(--destructive)" }}>Cancelado em</dt>
                    <dd
                      className="font-medium text-right"
                      style={{ color: "var(--destructive)" }}
                    >
                      {formatDate(training.canceledAt)}
                    </dd>
                  </div>
                  {training.cancelReason && (
                    <div className="flex justify-between gap-4">
                      <dt style={{ color: "var(--destructive)" }}>Motivo</dt>
                      <dd
                        className="font-medium text-right"
                        style={{ color: "var(--destructive)" }}
                      >
                        {training.cancelReason}
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
          Verificação fornecida pela{" "}
          <span className="font-semibold" style={{ color: "var(--azul-eletrico)" }}>
            Comproved
          </span>
        </p>
      </div>
    </main>
  );
}
