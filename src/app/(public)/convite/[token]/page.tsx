import crypto from "crypto";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/server/auth/auth";
import { findInvitationByTokenHash } from "@/server/models/invitation";
import { Logo } from "@/components/logo";
import { AcceptButton } from "./accept-button";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ConvitePage({ params }: Props) {
  const { token } = await params;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invitation = await findInvitationByTokenHash(tokenHash);

  const session = await auth.api.getSession({ headers: await headers() });
  const user = (session?.user ?? null) as {
    id: string;
    name: string;
    email: string;
    companyId?: string | null;
  } | null;

  const isValid =
    invitation &&
    !invitation.revokedAt &&
    !invitation.acceptedAt &&
    invitation.expiresAt > new Date();

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--nevoa)" }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-8"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size={36} tone="positive" />
        </div>

        {!isValid ? (
          /* ── Invalid / expired / used ── */
          <div className="text-center space-y-3">
            <h1
              className="text-xl font-extrabold"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Convite inválido
            </h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {invitation?.acceptedAt
                ? "Este convite já foi utilizado."
                : invitation?.revokedAt
                  ? "Este convite foi revogado."
                  : "Este convite expirou ou não existe."}
            </p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Entre em contato com o administrador da empresa para receber um novo
              convite.
            </p>
          </div>
        ) : (
          /* ── Valid invitation ── */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Convite de colaborador
              </p>
              <h1
                className="text-xl font-extrabold"
                style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
              >
                {invitation.company.name}
              </h1>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                convidou{" "}
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                  {invitation.name}
                </span>{" "}
                para colaborar
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Cargo:{" "}
                <span className="font-medium" style={{ color: "var(--foreground)" }}>
                  {invitation.jobTitle}
                </span>
              </p>
            </div>

            {!user ? (
              /* ── Not logged in ── */
              <div className="space-y-3">
                <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
                  Para aceitar, entre na sua conta:
                </p>
                <Link
                  href={`/login?redirect=/convite/${token}`}
                  className="cpv-btn cpv-btn--primary w-full"
                  style={{ justifyContent: "center", display: "flex" }}
                >
                  Entrar com e-mail
                </Link>
                <Link
                  href={`/cadastro?redirect=/convite/${token}`}
                  className="cpv-btn w-full"
                  style={{ justifyContent: "center", display: "flex" }}
                >
                  Criar conta
                </Link>
              </div>
            ) : user.companyId ? (
              /* ── Already in a company ── */
              <div
                className="text-sm text-center rounded-lg px-3 py-3 border"
                style={{
                  color: "var(--destructive)",
                  background: "var(--destructive-soft)",
                  borderColor: "var(--destructive-border)",
                }}
              >
                Sua conta já está associada a uma empresa. Não é possível aceitar
                este convite.
              </div>
            ) : (
              /* ── Logged in, no company ── */
              <div className="space-y-3">
                <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
                  Você está logado como{" "}
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {user.email}
                  </span>
                  .
                </p>
                <AcceptButton token={token} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
