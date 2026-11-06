"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Erro ao criar conta.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--nevoa)" }}
      >
        <div
          className="w-full max-w-sm rounded-xl border p-8 text-center"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex justify-center mb-6">
            <Logo size={36} tone="positive" />
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--success-soft)", color: "var(--success)", fontSize: 22 }}
          >
            ✓
          </div>
          <h2
            className="text-xl font-extrabold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
          >
            Verifique seu e-mail
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Enviamos um link de confirmação para{" "}
            <strong style={{ color: "var(--foreground)" }}>{email}</strong>.
            Clique no link para ativar sua conta e depois{" "}
            <button
              className="font-semibold"
              style={{ color: "var(--link)" }}
              onClick={() => router.push("/login")}
            >
              acesse o login
            </button>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--nevoa)" }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8"
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

        <h1
          className="text-xl font-extrabold text-center mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
        >
          Criar conta
        </h1>
        <p className="text-sm text-center mb-7" style={{ color: "var(--muted-foreground)" }}>
          Comece a comprovar treinamentos hoje
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border px-3 text-sm outline-none transition"
              style={{
                height: "var(--control-md)",
                borderColor: "var(--input)",
                background: "var(--card)",
                color: "var(--foreground)",
                fontFamily: "var(--font-sans)",
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--focus-halo)")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border px-3 text-sm outline-none transition"
              style={{
                height: "var(--control-md)",
                borderColor: "var(--input)",
                background: "var(--card)",
                color: "var(--foreground)",
                fontFamily: "var(--font-sans)",
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--focus-halo)")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border px-3 text-sm outline-none transition"
              style={{
                height: "var(--control-md)",
                borderColor: "var(--input)",
                background: "var(--card)",
                color: "var(--foreground)",
                fontFamily: "var(--font-sans)",
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--focus-halo)")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Mínimo de 8 caracteres
            </p>
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
            {pending ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-5 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold"
            style={{ color: "var(--link)" }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
