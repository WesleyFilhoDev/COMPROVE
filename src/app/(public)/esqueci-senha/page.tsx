"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/redefinir-senha",
    });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo */}
      <aside
        className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[460px] shrink-0 p-10"
        style={{ background: "var(--tinta)" }}
      >
        <div>
          <Link href="/">
            <Logo size={32} tone="negative" />
          </Link>

          <div className="mt-14">
            <h2
              className="text-3xl font-extrabold leading-snug"
              style={{ fontFamily: "var(--font-display)", color: "#fff" }}
            >
              Treinamento dado é<br />
              treinamento{" "}
              <span style={{ color: "var(--azul-sinal)" }}>comprovado.</span>
            </h2>

            <p className="mt-5 text-sm leading-relaxed" style={{ color: "var(--sidebar-foreground)" }}>
              Enviaremos um link seguro para o seu e-mail com as instruções para criar uma nova senha.
            </p>
          </div>
        </div>

        <p className="text-xs" style={{ color: "var(--sidebar-foreground)" }}>
          © {new Date().getFullYear()} Comproved
        </p>
      </aside>

      {/* Painel direito */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto" style={{ background: "#fff" }}>
        <div className="flex justify-between items-center px-8 pt-7">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "var(--muted-foreground)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar para o login
          </Link>
          <div className="lg:hidden">
            <Logo size={24} />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            {sent ? (
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "var(--success-soft, #f0fdf4)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="var(--azul-eletrico)" strokeWidth="1.5" />
                    <path d="M22 6l-10 7L2 6" stroke="var(--azul-eletrico)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                <h1
                  className="text-2xl font-extrabold mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
                >
                  Verifique seu e-mail
                </h1>
                <p className="text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Enviamos um link para
                </p>
                <p className="text-sm font-semibold mb-5" style={{ color: "var(--foreground)" }}>
                  {email}
                </p>
                <p className="text-sm mb-7" style={{ color: "var(--muted-foreground)" }}>
                  Clique no link do e-mail para criar uma nova senha. O link expira em 1 hora.
                </p>

                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Não recebeu?{" "}
                  <button
                    type="button"
                    onClick={() => { setSent(false); setEmail(""); }}
                    className="font-semibold"
                    style={{ color: "var(--link)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Tentar novamente
                  </button>
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--azul-eletrico)" }}>
                  Recuperar acesso
                </p>
                <h1
                  className="text-2xl font-extrabold mb-1"
                  style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
                >
                  Esqueceu sua senha?
                </h1>
                <p className="text-sm mb-7" style={{ color: "var(--muted-foreground)" }}>
                  Digite o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="nome@empresa.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border px-3 text-sm outline-none transition"
                      style={{
                        height: "var(--control-md)",
                        borderColor: "var(--input)",
                        background: "#fff",
                        color: "var(--foreground)",
                        fontFamily: "var(--font-sans)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--focus-halo)")}
                      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                    />
                  </div>

                  {error && (
                    <p
                      className="text-sm rounded-lg px-3 py-2 border"
                      style={{
                        color: "var(--destructive)",
                        background: "var(--destructive-soft)",
                        borderColor: "var(--destructive-border)",
                      }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pending}
                    className="cpv-btn cpv-btn--primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {pending ? "Enviando…" : "Enviar link de recuperação"}
                  </button>
                </form>

                <p className="text-sm text-center mt-5" style={{ color: "var(--muted-foreground)" }}>
                  Lembrou a senha?{" "}
                  <Link href="/login" className="font-semibold" style={{ color: "var(--link)" }}>
                    Entrar
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
