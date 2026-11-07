"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";

type Role = "gestor" | "instrutor";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("gestor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setPending(false);
      setError(result.error.message ?? "E-mail ou senha incorretos.");
      return;
    }

    // Busca a sessão para verificar o papel real do usuário
    const session = await authClient.getSession();
    const userRole = (session.data?.user as Record<string, unknown> | null)?.role as string | null;

    // Valida que o perfil selecionado bate com o papel real
    if (role === "gestor" && userRole !== "ADMIN") {
      await authClient.signOut();
      setPending(false);
      setError('Esta conta é de instrutor. Use o perfil "Entrar como instrutor".');
      return;
    }

    if (role === "instrutor" && userRole !== "COLLABORATOR") {
      await authClient.signOut();
      setPending(false);
      setError('Esta conta é de gestor. Use o perfil "Entrar como gestor".');
      return;
    }

    router.push("/dashboard");
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
              Escolha como você quer entrar. Cada perfil abre a própria tela.
            </p>

            <div className="mt-8 space-y-3">
              <div
                className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: "var(--azul-eletrico)", color: "#fff" }}
                >
                  CC
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#fff" }}>Gestor da conta</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--sidebar-foreground)" }}>
                    Relatórios, instrutores e tipos de treinamento
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: "var(--sidebar-accent)", color: "var(--azul-sinal)" }}
                >
                  AI
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#fff" }}>Instrutor</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--sidebar-foreground)" }}>
                    Registro de treinamentos e envio para assinatura
                  </p>
                </div>
              </div>
            </div>
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
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "var(--muted-foreground)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar para o site
          </Link>
          <div className="lg:hidden">
            <Logo size={24} />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--azul-eletrico)" }}>
              Entrar
            </p>
            <h1
              className="text-2xl font-extrabold mb-1"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Entre na sua conta
            </h1>
            <p className="text-sm mb-7" style={{ color: "var(--muted-foreground)" }}>
              Escolha seu perfil e use o e-mail e a senha que você cadastrou.
            </p>

            {/* Toggle de perfil */}
            <div className="mb-5">
              <p className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Como você quer entrar?
              </p>
              <div
                className="flex gap-2 p-1 rounded-xl"
                style={{ background: "var(--nevoa)", border: "1px solid var(--border)" }}
              >
                {(["gestor", "instrutor"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all"
                    style={{
                      background: role === r ? "#fff" : "transparent",
                      color: role === r ? "var(--tinta)" : "var(--muted-foreground)",
                      boxShadow: role === r ? "var(--shadow-sm)" : "none",
                      border: role === r ? "1px solid var(--border)" : "1px solid transparent",
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{
                        background: role === r ? "var(--azul-eletrico)" : "var(--muted)",
                        color: role === r ? "#fff" : "var(--muted-foreground)",
                      }}
                    >
                      {r === "gestor" ? "CC" : "AI"}
                    </span>
                    {r === "gestor" ? "Entrar como gestor" : "Entrar como instrutor"}
                  </button>
                ))}
              </div>
            </div>

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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Senha
                  </label>
                  <Link
                    href="/esqueci-senha"
                    className="text-xs font-medium"
                    style={{ color: "var(--link)" }}
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: "var(--azul-eletrico)" }}
                />
                <span className="text-sm" style={{ color: "var(--foreground)" }}>
                  Manter conectado neste dispositivo
                </span>
              </label>

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
                {pending
                  ? "Entrando…"
                  : role === "gestor"
                  ? "Entrar como gestor"
                  : "Entrar como instrutor"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>ou</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold" style={{ color: "var(--link)" }}>
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
