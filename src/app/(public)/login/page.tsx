"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await authClient.signIn.email({
      email,
      password,
    });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "E-mail ou senha incorretos.");
      return;
    }

    router.push("/dashboard");
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
          Entrar na sua conta
        </h1>
        <p className="text-sm text-center mb-7" style={{ color: "var(--muted-foreground)" }}>
          Bem-vindo de volta
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              required
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
            className="cpv-btn cpv-btn--primary w-full"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-semibold"
            style={{ color: "var(--link)" }}
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
