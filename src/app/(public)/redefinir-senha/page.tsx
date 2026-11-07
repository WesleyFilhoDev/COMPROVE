"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";

function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}

const strengthLabel = ["", "Fraca", "Razoável", "Boa", "Forte"];
const strengthColor = ["", "var(--destructive)", "#f59e0b", "#3b82f6", "#22c55e"];

function RedefinirSenhaForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = passwordStrength(password);
  const mismatch = confirm.length > 0 && password !== confirm;

  useEffect(() => {
    if (!token) {
      setError("Link inválido ou expirado. Solicite um novo link de recuperação.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setError(null);
    setPending(true);

    const result = await authClient.resetPassword({ newPassword: password, token });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Não foi possível redefinir a senha. O link pode ter expirado.");
      return;
    }

    setDone(true);
  }

  return (
    <div className="w-full max-w-sm">
      {done ? (
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "var(--success-soft, #f0fdf4)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" stroke="var(--azul-eletrico)" strokeWidth="1.5" />
              <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="var(--azul-eletrico)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1
            className="text-2xl font-extrabold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
          >
            Senha redefinida!
          </h1>
          <p className="text-sm mb-7" style={{ color: "var(--muted-foreground)" }}>
            Sua nova senha foi salva com sucesso. Você já pode entrar na sua conta.
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="cpv-btn cpv-btn--primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Ir para o login
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--azul-eletrico)" }}>
            Nova senha
          </p>
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
          >
            Redefinir senha
          </h1>
          <p className="text-sm mb-7" style={{ color: "var(--muted-foreground)" }}>
            Crie uma nova senha para a sua conta. Use pelo menos 8 caracteres.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova senha */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                Nova senha
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border px-3 text-sm outline-none transition"
                  style={{
                    height: "var(--control-md)",
                    borderColor: "var(--input)",
                    background: "#fff",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-sans)",
                    paddingRight: "2.25rem",
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--focus-halo)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    color: "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.9 5.2 2 6.5 2 8c0 2.5 2.7 5 6 5a7.6 7.6 0 0 0 3.8-1.1M6.5 3.1C7 3 7.5 3 8 3c3.3 0 6 2.5 6 5 0 .8-.3 1.6-.7 2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <ellipse cx="8" cy="8" rx="6" ry="5" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Indicador de força */}
              {password.length > 0 && (
                <div>
                  <div className="flex gap-1 mt-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-colors"
                        style={{
                          background: i <= strength ? strengthColor[strength] : "var(--border)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                Confirmar nova senha
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="block w-full rounded-lg border px-3 text-sm outline-none transition"
                  style={{
                    height: "var(--control-md)",
                    borderColor: mismatch ? "var(--destructive)" : "var(--input)",
                    background: "#fff",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-sans)",
                    paddingRight: "2.25rem",
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--focus-halo)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    color: "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirm ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.9 5.2 2 6.5 2 8c0 2.5 2.7 5 6 5a7.6 7.6 0 0 0 3.8-1.1M6.5 3.1C7 3 7.5 3 8 3c3.3 0 6 2.5 6 5 0 .8-.3 1.6-.7 2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <ellipse cx="8" cy="8" rx="6" ry="5" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  )}
                </button>
              </div>
              {mismatch && (
                <p className="text-xs" style={{ color: "var(--destructive)" }}>
                  As senhas não coincidem.
                </p>
              )}
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
              disabled={pending || !token}
              className="cpv-btn cpv-btn--primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {pending ? "Salvando…" : "Redefinir senha"}
            </button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: "var(--muted-foreground)" }}>
            Link expirado?{" "}
            <Link href="/esqueci-senha" className="font-semibold" style={{ color: "var(--link)" }}>
              Solicitar novo link
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function RedefinirSenhaPage() {
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
              Crie uma senha forte para manter sua conta segura.
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
          <Suspense fallback={<div style={{ color: "var(--muted-foreground)", fontSize: 14 }}>Carregando…</div>}>
            <RedefinirSenhaForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
