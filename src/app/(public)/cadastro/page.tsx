"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { maskPhone } from "@/lib/format";

const SEGMENTS = [
  "Construção Civil",
  "Indústria",
  "Logística e Transporte",
  "Mineração",
  "Óleo e Gás",
  "Saúde",
  "Segurança Privada",
  "Tecnologia",
  "Varejo",
  "Outro",
];

const CARGO_OPTIONS = [
  "Gestor de RH",
  "Coordenador de Segurança do Trabalho",
  "Diretor",
  "Gerente",
  "Analista",
  "Técnico de Segurança",
  "Proprietário",
  "Outro",
];

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [segment, setSegment] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const passwordsMatch = !confirm || password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!terms) {
      setError("Você precisa aceitar os termos de uso.");
      return;
    }

    setError(null);
    setPending(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, jobTitle, companyName, segment }),
    });

    setPending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Erro ao criar conta. Tente novamente.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex">
        <aside
          className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[460px] shrink-0 p-10"
          style={{ background: "var(--tinta)" }}
        >
          <Link href="/"><Logo size={32} tone="negative" /></Link>
          <p className="text-xs" style={{ color: "var(--sidebar-foreground)" }}>© {new Date().getFullYear()} Comproved</p>
        </aside>
        <main className="flex-1 flex items-center justify-center p-6" style={{ background: "#fff" }}>
          <div className="w-full max-w-sm text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--success-soft)", color: "var(--success)", fontSize: 26 }}
            >
              ✓
            </div>
            <h2
              className="text-2xl font-extrabold mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Verifique seu e-mail
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted-foreground)" }}>
              Enviamos um link de confirmação para{" "}
              <strong style={{ color: "var(--foreground)" }}>{email}</strong>.
              Clique no link para ativar sua conta.
            </p>
            <button
              className="cpv-btn cpv-btn--primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => router.push("/login")}
            >
              Ir para o login
            </button>
          </div>
        </main>
      </div>
    );
  }

  const inputStyle = {
    height: "var(--control-md)",
    borderColor: "var(--input)",
    background: "#fff",
    color: "var(--foreground)",
    fontFamily: "var(--font-sans)",
  };

  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.boxShadow = "var(--focus-halo)");
  const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.boxShadow = "none");

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo */}
      <aside
        className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[460px] shrink-0 p-10"
        style={{ background: "var(--tinta)" }}
      >
        <div>
          <Link href="/"><Logo size={32} tone="negative" /></Link>

          <div className="mt-14">
            <h2
              className="text-3xl font-extrabold leading-snug"
              style={{ fontFamily: "var(--font-display)", color: "#fff" }}
            >
              Treinamento dado é<br />
              treinamento{" "}
              <span style={{ color: "var(--azul-sinal)" }}>comprovado.</span>
            </h2>

            <ul className="mt-8 space-y-4">
              {[
                "Registro de quem ministrou, quem recebeu, data e horário",
                "Assinatura do instrutor e dos participantes pelo celular",
                "Comprovante com código de verificação público",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="9" fill="rgba(42,91,255,0.2)" />
                    <path d="M5.5 9L7.5 11L12.5 6.5" stroke="var(--azul-sinal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm leading-relaxed" style={{ color: "var(--sidebar-foreground)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card documento verificado */}
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--azul-eletrico)" }}
          >
            <Logo size={22} tone="negative" variant="symbol" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--azul-sinal)" }}>
              Documento verificado
            </p>
            <p className="text-xs font-mono" style={{ color: "#fff" }}>CPV · 2826-986184</p>
            <p className="text-xs" style={{ color: "var(--sidebar-foreground)" }}>
              Emitido em 05/11/2026 · 3 de 3 assinaturas
            </p>
          </div>
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-mono shrink-0"
            style={{ background: "rgba(255,255,255,0.1)", color: "var(--sidebar-foreground)" }}
          >
            QR
          </div>
        </div>
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

        <div className="flex-1 px-6 py-10 max-w-xl mx-auto w-full">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--azul-eletrico)" }}>
            Criar conta
          </p>
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
          >
            Crie a conta da sua empresa
          </h1>
          <p className="text-sm mb-7" style={{ color: "var(--muted-foreground)" }}>
            Você será o gestor da conta e poderá{" "}
            <span style={{ color: "var(--link)" }}>convidar os instrutores</span> depois.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seus dados */}
            <section>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--tinta)" }}>
                Seus dados
              </h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Nome completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Ana Souza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border px-3 text-sm outline-none transition"
                    style={inputStyle}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    E-mail corporativo
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
                    style={inputStyle}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Você vai usar este e-mail para entrar.
                  </p>
                </div>

                {/* Senha lado a lado */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Senha
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      placeholder="Use 8 caracteres ou mais"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border px-3 text-sm outline-none transition"
                      style={inputStyle}
                      onFocus={focusOn}
                      onBlur={focusOff}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirm" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Confirmar senha
                    </label>
                    <input
                      id="confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      placeholder="Digite a mesma senha"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="block w-full rounded-lg border px-3 text-sm outline-none transition"
                      style={{
                        ...inputStyle,
                        borderColor: !passwordsMatch ? "var(--destructive)" : "var(--input)",
                      }}
                      onFocus={focusOn}
                      onBlur={focusOff}
                    />
                    {!passwordsMatch && (
                      <p className="text-xs" style={{ color: "var(--destructive)" }}>
                        As duas senhas são iguais
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    WhatsApp{" "}
                    <span className="font-normal" style={{ color: "var(--muted-foreground)" }}>(Opcional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(11) 90000-0000"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    className="block w-full rounded-lg border px-3 text-sm outline-none transition"
                    style={inputStyle}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                </div>
              </div>
            </section>

            {/* Sua empresa */}
            <section>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--tinta)" }}>
                Sua empresa
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="companyName" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Nome da empresa
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      required
                      placeholder="Software Exemplo"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="block w-full rounded-lg border px-3 text-sm outline-none transition"
                      style={inputStyle}
                      onFocus={focusOn}
                      onBlur={focusOff}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="jobTitle" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Seu cargo
                    </label>
                    <select
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="block w-full rounded-lg border px-3 text-sm outline-none transition appearance-none"
                      style={{ ...inputStyle, cursor: "pointer" }}
                      onFocus={focusOn}
                      onBlur={focusOff}
                    >
                      <option value="">Selecione...</option>
                      {CARGO_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="segment" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Segmento
                  </label>
                  <select
                    id="segment"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="block w-full rounded-lg border px-3 text-sm outline-none transition appearance-none"
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  >
                    <option value="">Selecione...</option>
                    {SEGMENTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Termos */}
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 rounded shrink-0"
                  style={{ accentColor: "var(--azul-eletrico)" }}
                />
                <span className="text-sm" style={{ color: "var(--foreground)" }}>
                  Li e aceito os{" "}
                  <Link href="/termos" className="font-medium" style={{ color: "var(--link)" }}>
                    termos de uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" className="font-medium" style={{ color: "var(--link)" }}>
                    política de privacidade
                  </Link>
                  .
                </span>
              </label>
              <div className="flex gap-4 pl-6">
                <Link href="/termos" className="text-xs" style={{ color: "var(--muted-foreground)" }}>Termos de uso</Link>
                <Link href="/privacidade" className="text-xs" style={{ color: "var(--muted-foreground)" }}>Política de privacidade</Link>
              </div>
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
            <Link href="/login" className="font-semibold" style={{ color: "var(--link)" }}>
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
