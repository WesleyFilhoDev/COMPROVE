import Link from "next/link";
import { Logo } from "@/components/logo";

/* ─────────────────────────────────────────────
   Landing page — server component
───────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      {/* ══════════════════════════════════════
          1 · HERO  (dark grid)
      ══════════════════════════════════════ */}
      <section className="lp-grid-bg">
        {/* ── Navbar ── */}
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" aria-label="Comproved">
            <Logo size={32} tone="negative" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#o-problema" className="lp-navlink">O problema</a>
            <a href="#como-funciona" className="lp-navlink">Como funciona</a>
            <a href="#relatorios" className="lp-navlink">Relatórios</a>
            <a href="#verificacao" className="lp-navlink">Verificação</a>
            <a href="#perguntas" className="lp-navlink">Perguntas</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="lp-navlink hidden sm:inline-flex">
              Entrar
            </Link>
            <Link href="/cadastro" className="cpv-btn cpv-btn--primary cpv-btn--sm">
              Criar conta
            </Link>
          </div>
        </nav>

        {/* ── Hero content ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pt-28 md:pb-36 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-8"
            style={{ borderColor: "var(--sidebar-border)", background: "rgba(255,255,255,0.05)" }}
          >
            <span className="cpv-badge--assinado cpv-badge" style={{ border: "none", background: "transparent", padding: 0 }} />
            <span style={{ color: "var(--azul-sinal)", fontSize: 13, fontWeight: 500 }}>
              Comprovação de treinamentos em tempo real
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-3xl mx-auto"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Treinamento dado é treinamento{" "}
            <span style={{ color: "var(--azul-sinal)" }}>comprovado✓</span>
          </h1>

          <p
            className="mt-6 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--sidebar-foreground)" }}
          >
            O Comproved registra quem ministrou, quem recebeu, a data e o
            horário de cada treinamento — e gera um comprovante verificável
            que qualquer pessoa pode conferir.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="cpv-btn cpv-btn--secondary cpv-btn--lg">
              Criar conta
            </Link>
            <a href="#como-funciona" className="lp-link-dark text-base">
              Ver como funciona →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          2 · ANATOMIA DO REGISTRO
      ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--azul-eletrico)" }}
            >
              Registro de treinamento
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Tudo que importa, num só comprovante
            </h2>
          </div>

          {/* Mock card */}
          <div
            className="max-w-lg mx-auto rounded-xl border p-6"
            style={{
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-lg)",
              background: "var(--card)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Treinamento
                </p>
                <p className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}>
                  Módulo de Estoque — Turma B
                </p>
              </div>
              <span className="cpv-badge cpv-badge--assinado">Assinado</span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Instrutor</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>Carlos Ribeiro</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Treinado</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>Ana Lima</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Data</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>04/11/2026</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Horário</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>09:00 – 11:30</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Código de verificação</p>
                <p
                  className="text-xs mt-1 tracking-widest font-semibold"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--azul-eletrico)" }}
                >
                  CPV-2026-A4X9-7K2M
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="var(--azul-eletrico)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="9" stroke="var(--azul-eletrico)" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3 · O PROBLEMA
      ══════════════════════════════════════ */}
      <section id="o-problema" className="py-16 sm:py-20" style={{ background: "var(--nevoa)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--destructive)" }}
            >
              O problema
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Sem comprovação, o custo aparece depois
            </h2>
            <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: "var(--muted-foreground)" }}>
              Empresas perdem horas e dinheiro toda vez que precisam provar que
              um treinamento aconteceu — ou descobrem que o registro não existia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Treinamento refeito",
                desc: "Sem registro, o treinamento precisa ser repetido — pagando duas vezes pelo mesmo conteúdo.",
                icon: "↩",
              },
              {
                title: "Suporte sobrecarregado",
                desc: "O time de suporte atende dúvidas que já foram respondidas, porque o colaborador não tem onde consultar.",
                icon: "📞",
              },
              {
                title: "Cobrança contestada",
                desc: "O cliente questiona o serviço prestado e a empresa não consegue provar que o treinamento ocorreu.",
                icon: "⚖",
              },
              {
                title: "Relatório feito à mão",
                desc: "Planilhas e e-mails viram a única fonte de verdade — e ninguém confia nos dados.",
                icon: "📋",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl p-6 border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-xs)",
                }}
              >
                <div className="text-2xl mb-4">{card.icon}</div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4 · ANTES E DEPOIS
      ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Com o Comproved, a história muda
            </h2>
            <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: "var(--muted-foreground)" }}>
              Compare o que acontece antes e depois de adotar a comprovação
              automatizada.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-semibold w-1/3" style={{ color: "var(--muted-foreground)", borderBottom: "2px solid var(--border)" }}>
                    Situação
                  </th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--destructive)", borderBottom: "2px solid var(--border)" }}>
                    Antes
                  </th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--success)", borderBottom: "2px solid var(--border)" }}>
                    Com o Comproved
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Comprovante de treinamento", "Planilha manual ou nenhum", "Comprovante digital assinado"],
                  ["Auditoria ou fiscalização", "Horas buscando evidências", "Exporta em segundos"],
                  ["Contestação de cliente", "Sem provas, sem defesa", "Código de verificação público"],
                  ["Relatório mensal", "Montado à mão no Excel", "Gerado automaticamente"],
                  ["Histórico do colaborador", "Disperso em e-mails", "Centralizado e filtrado"],
                  ["Retrabalho de treinamento", "Frequente e custoso", "Elimina com registro preciso"],
                ].map(([sit, before, after], i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="py-4 px-4 font-medium" style={{ color: "var(--foreground)" }}>{sit}</td>
                    <td className="py-4 px-4" style={{ color: "var(--muted-foreground)" }}>
                      <span
                        className="inline-flex items-center gap-2"
                        style={{ color: "var(--destructive)" }}
                      >
                        <span>✗</span> {before}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className="inline-flex items-center gap-2"
                        style={{ color: "var(--success)" }}
                      >
                        <span>✓</span> {after}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5 · COMO FUNCIONA
      ══════════════════════════════════════ */}
      <section id="como-funciona" className="py-16 sm:py-20" style={{ background: "var(--nevoa)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--azul-eletrico)" }}
            >
              Como funciona
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Do treinamento ao comprovante, em 4 passos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                n: "1",
                title: "Registrar o treinamento",
                desc: "O administrador ou instrutor cria o registro com título, data, horário e participantes.",
              },
              {
                n: "2",
                title: "Coleta as assinaturas",
                desc: "Instrutor e treinados assinam digitalmente via link ou QR code, sem precisar de app.",
              },
              {
                n: "3",
                title: "Gera o comprovante",
                desc: "O Comproved gera automaticamente um comprovante PDF com código único verificável.",
              },
              {
                n: "4",
                title: "Verificação pública",
                desc: "Qualquer pessoa pode conferir a autenticidade do comprovante em comproved.com.br/verificar.",
              },
            ].map((step) => (
              <div key={step.n} className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm mb-4"
                  style={{
                    background: "var(--azul-eletrico)",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {step.n}
                </div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6 · PAPÉIS (dark grid)
      ══════════════════════════════════════ */}
      <section className="lp-grid-bg py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--azul-sinal)" }}
            >
              Papéis
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Um sistema para cada perfil
            </h2>
            <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: "var(--sidebar-foreground)" }}>
              Cada participante vê e faz exatamente o que precisa — sem
              sobrecarga de funcionalidades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "Admin",
                icon: "⚙",
                desc: "Gerencia a empresa, cadastra colaboradores, cria tipos de treinamento, visualiza todos os relatórios e exporta comprovantes.",
                items: ["Gestão de equipe", "Tipos de treinamento", "Relatórios completos", "Exportação PDF"],
              },
              {
                role: "Instrutor",
                icon: "🎓",
                desc: "Cria e conduz treinamentos, coleta assinaturas dos participantes e acompanha o status de cada turma.",
                items: ["Criar treinamentos", "Coletar assinaturas", "Ver histórico de turmas", "Emitir comprovante"],
              },
              {
                role: "Treinado",
                icon: "👤",
                desc: "Recebe o link de assinatura, assina o comprovante e acessa seu histórico de treinamentos recebidos.",
                items: ["Assinar via link/QR", "Ver histórico pessoal", "Baixar comprovante", "Verificar autenticidade"],
              },
            ].map((r) => (
              <div
                key={r.role}
                className="rounded-xl p-6 border"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderColor: "var(--sidebar-border)",
                }}
              >
                <div className="text-3xl mb-4">{r.icon}</div>
                <h3
                  className="text-lg font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {r.role}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--sidebar-foreground)" }}>
                  {r.desc}
                </p>
                <ul className="space-y-2">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--azul-sinal)" }}>
                      <span>✓</span>
                      <span style={{ color: "var(--sidebar-foreground)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7 · RELATÓRIOS
      ══════════════════════════════════════ */}
      <section id="relatorios" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--azul-eletrico)" }}
              >
                Relatórios
              </p>
              <h2
                className="text-3xl font-extrabold tracking-tight mb-4"
                style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
              >
                O fechamento do mês já vem pronto
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "var(--muted-foreground)" }}>
                Veja quantos treinamentos foram realizados, por quem, em qual
                período — sem montar planilha. Filtre por instrutor, tipo de
                treinamento ou colaborador.
              </p>
              <ul className="space-y-3">
                {[
                  "Treinamentos por período",
                  "Horas treinadas por colaborador",
                  "Pendências de assinatura",
                  "Exportação CSV e PDF",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                      style={{ background: "var(--success-soft)", color: "var(--success)" }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mockup bar chart */}
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
            >
              <p className="text-sm font-semibold mb-4" style={{ color: "var(--muted-foreground)" }}>
                Treinamentos por mês
              </p>
              <div className="flex items-end gap-3 h-32">
                {[
                  { label: "Ago", v: 55 },
                  { label: "Set", v: 70 },
                  { label: "Out", v: 45 },
                  { label: "Nov", v: 90 },
                  { label: "Dez", v: 60 },
                  { label: "Jan", v: 80 },
                ].map((bar) => (
                  <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${bar.v}%`,
                        background:
                          bar.label === "Nov"
                            ? "var(--azul-eletrico)"
                            : "var(--azul-gelo)",
                      }}
                    />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          8 · VERIFICAÇÃO PÚBLICA
      ══════════════════════════════════════ */}
      <section id="verificacao" className="py-16 sm:py-20" style={{ background: "var(--nevoa)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Code mockup */}
            <div
              className="rounded-xl border p-6 order-2 lg:order-1"
              style={{ borderColor: "var(--border)", background: "var(--card)", boxShadow: "var(--shadow-lg)" }}
            >
              <p className="text-sm font-semibold mb-4" style={{ color: "var(--muted-foreground)" }}>
                Verificar comprovante
              </p>
              <div
                className="flex items-center gap-2 rounded-lg border px-4"
                style={{ borderColor: "var(--border)", height: "var(--control-lg)" }}
              >
                <span
                  className="text-sm tracking-widest font-semibold flex-1"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
                >
                  CPV-2026-A4X9-7K2M
                </span>
                <button className="cpv-btn cpv-btn--primary cpv-btn--sm" type="button">
                  Verificar
                </button>
              </div>

              {/* Result card */}
              <div
                className="mt-4 rounded-lg p-4 border"
                style={{ borderColor: "var(--success-border)", background: "var(--success-soft)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "var(--success)", color: "#fff", fontSize: 14 }}
                  >
                    ✓
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "var(--success)" }}>
                    Comprovante autêntico
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--success)" }}>
                  <div>
                    <span className="opacity-70">Treinamento</span>
                    <p className="font-medium mt-0.5">Módulo de Estoque</p>
                  </div>
                  <div>
                    <span className="opacity-70">Data</span>
                    <p className="font-medium mt-0.5">04/11/2026</p>
                  </div>
                  <div>
                    <span className="opacity-70">Treinado</span>
                    <p className="font-medium mt-0.5">Ana Lima</p>
                  </div>
                  <div>
                    <span className="opacity-70">Instrutor</span>
                    <p className="font-medium mt-0.5">Carlos Ribeiro</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--azul-eletrico)" }}
              >
                Verificação pública
              </p>
              <h2
                className="text-3xl font-extrabold tracking-tight mb-4"
                style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
              >
                Qualquer pessoa pode conferir
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: "var(--muted-foreground)" }}>
                Cada comprovante gerado pelo Comproved tem um código único. Com
                ele, seu cliente, seu auditor ou qualquer interessado pode
                confirmar a autenticidade — sem login, sem burocracia.
              </p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Acesse{" "}
                <span
                  className="font-semibold"
                  style={{ color: "var(--azul-eletrico)" }}
                >
                  comproved.com.br/verificar
                </span>{" "}
                e insira o código do comprovante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          9 · TRILHA DE REGISTRO
      ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--azul-eletrico)" }}
            >
              Trilha de auditoria
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Cada evento, registrado
            </h2>
            <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: "var(--muted-foreground)" }}>
              Toda ação no Comproved gera uma linha imutável na trilha de
              registro — do início ao comprovante assinado.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            {[
              { time: "04/11/2026 · 08:52", label: "Treinamento criado", who: "Carlos Ribeiro (instrutor)", color: "var(--azul-eletrico)" },
              { time: "04/11/2026 · 09:00", label: "Treinamento iniciado", who: "Carlos Ribeiro (instrutor)", color: "var(--azul-eletrico)" },
              { time: "04/11/2026 · 09:03", label: "Assinatura coletada", who: "Ana Lima (treinado)", color: "var(--success)" },
              { time: "04/11/2026 · 11:30", label: "Treinamento encerrado", who: "Carlos Ribeiro (instrutor)", color: "var(--azul-eletrico)" },
              { time: "04/11/2026 · 11:31", label: "Comprovante emitido", who: "Sistema", color: "var(--success)" },
            ].map((ev, i, arr) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ background: ev.color }}
                  />
                  {i < arr.length - 1 && (
                    <div
                      className="w-px flex-1 mt-1"
                      style={{ background: "var(--border)", minHeight: 32 }}
                    />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {ev.time}
                  </p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>
                    {ev.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {ev.who}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          10 · SEGURANÇA (dark grid)
      ══════════════════════════════════════ */}
      <section className="lp-grid-bg py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--azul-sinal)" }}
            >
              Segurança
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Segurança que não compromete a usabilidade
            </h2>
            <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: "var(--sidebar-foreground)" }}>
              Protegemos os dados da sua empresa sem adicionar fricção para
              quem usa o dia a dia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Dados criptografados",
                desc: "Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256).",
                icon: "🔒",
              },
              {
                title: "Multi-tenancy isolado",
                desc: "Cada empresa opera em um espaço completamente isolado — sem acesso cruzado.",
                icon: "🏢",
              },
              {
                title: "Acesso por papéis",
                desc: "Controle granular de permissões: cada usuário vê apenas o que deve ver.",
                icon: "🛡",
              },
              {
                title: "Logs imutáveis",
                desc: "A trilha de auditoria é append-only — nenhum registro pode ser alterado ou apagado.",
                icon: "📝",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-xl p-6 border"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderColor: "var(--sidebar-border)",
                }}
              >
                <div className="text-2xl mb-4">{p.icon}</div>
                <h3
                  className="font-bold text-white text-base mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--sidebar-foreground)" }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          11 · PARA QUEM É
      ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--azul-eletrico)" }}
            >
              Para quem é
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Feito para quem treina pessoas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Empresa de serviços B2B",
                desc: "Prove para seus clientes que a equipe foi treinada antes de cada projeto.",
                icon: "🏭",
              },
              {
                title: "Instrutores autônomos",
                desc: "Emita comprovantes profissionais e construa histórico de cada aluno.",
                icon: "🎓",
              },
              {
                title: "RH corporativo",
                desc: "Centralize o histórico de capacitações, integre onboarding e reporte em segundos.",
                icon: "👥",
              },
              {
                title: "Escritório jurídico",
                desc: "Prove conformidade regulatória com documentos verificáveis a qualquer momento.",
                icon: "⚖",
              },
            ].map((profile) => (
              <div
                key={profile.title}
                className="rounded-xl p-6 border"
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="text-2xl mb-3">{profile.icon}</div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
                >
                  {profile.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {profile.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          12 · PERGUNTAS FREQUENTES
      ══════════════════════════════════════ */}
      <section id="perguntas" className="py-16 sm:py-20" style={{ background: "var(--nevoa)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--azul-eletrico)" }}
            >
              Dúvidas frequentes
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Perguntas e respostas
            </h2>
          </div>

          <div>
            {[
              {
                q: "O comprovante tem validade jurídica?",
                a: "O comprovante digital gerado pelo Comproved é um documento eletrônico com metadados de autoria, data/hora e código de verificação único. Embora não substitua uma assinatura qualificada por certificado digital (ICP-Brasil), ele serve como evidência robusta em disputas contratuais e fiscalizações internas.",
              },
              {
                q: "Preciso instalar algum aplicativo?",
                a: "Não. O Comproved é 100% web. Administradores, instrutores e treinados acessam pelo navegador — no celular ou no computador — sem instalar nada.",
              },
              {
                q: "Como funciona a assinatura do treinado?",
                a: "O instrutor compartilha um link ou QR code. O treinado acessa pelo celular, confirma os dados do treinamento e assina digitalmente. O processo leva menos de 30 segundos.",
              },
              {
                q: "Meus dados ficam seguros?",
                a: "Sim. Todos os dados são criptografados em trânsito e em repouso. Cada empresa opera em um ambiente isolado — nenhuma informação de um cliente é acessível por outro.",
              },
              {
                q: "Posso exportar os dados da minha empresa?",
                a: "Sim. Você pode exportar relatórios em CSV e comprovantes em PDF a qualquer momento, sem custo adicional.",
              },
              {
                q: "Existe um plano gratuito?",
                a: "Sim, oferecemos um plano gratuito para instrutores e pequenas equipes com até 10 treinamentos por mês. Para volumes maiores, temos planos mensais sem fidelidade.",
              },
              {
                q: "Como cancelo minha conta?",
                a: "Você pode cancelar a qualquer momento nas configurações da conta. Seus dados ficam disponíveis para exportação por 30 dias após o cancelamento.",
              },
            ].map((faq, i) => (
              <details key={i} className="faq-item">
                <summary>{faq.q}</summary>
                <div className="faq-answer">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          13 · CTA CRIAR CONTA (dark grid)
      ══════════════════════════════════════ */}
      <section className="lp-grid-bg py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Comece agora, ajuste depois
          </h2>
          <p className="text-base mb-10" style={{ color: "var(--sidebar-foreground)" }}>
            Crie sua conta grátis em menos de 2 minutos. Sem cartão de crédito,
            sem fidelidade — só comprovação de verdade.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { title: "Gratuito", price: "R$ 0", desc: "Até 10 treinamentos/mês", cta: "Começar grátis", primary: false },
              { title: "Pro", price: "R$ 79", desc: "Ilimitado + relatórios", cta: "Criar conta Pro", primary: true },
              { title: "Equipe", price: "R$ 199", desc: "Multi-usuários + API", cta: "Falar com vendas", primary: false },
            ].map((plan) => (
              <div
                key={plan.title}
                className="rounded-xl p-5 border flex flex-col items-center text-center"
                style={{
                  background: plan.primary ? "var(--azul-eletrico)" : "rgba(255,255,255,0.07)",
                  borderColor: plan.primary ? "var(--azul-eletrico)" : "var(--sidebar-border)",
                }}
              >
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: plan.primary ? "rgba(255,255,255,0.8)" : "var(--azul-sinal)" }}
                >
                  {plan.title}
                </p>
                <p
                  className="text-2xl font-extrabold text-white mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {plan.price}
                </p>
                <p
                  className="text-xs mb-5"
                  style={{ color: plan.primary ? "rgba(255,255,255,0.7)" : "var(--sidebar-foreground)" }}
                >
                  {plan.desc}
                </p>
                <Link
                  href="/cadastro"
                  className="cpv-btn cpv-btn--sm"
                  style={{
                    background: plan.primary ? "#fff" : "transparent",
                    color: plan.primary ? "var(--azul-eletrico)" : "var(--azul-sinal)",
                    borderColor: plan.primary ? "transparent" : "var(--sidebar-border)",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-sm" style={{ color: "var(--sidebar-foreground)" }}>
            Já tem conta?{" "}
            <Link href="/login" className="lp-link-dark">
              Entrar
            </Link>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          14 · FOOTER
      ══════════════════════════════════════ */}
      <footer
        className="py-10 border-t"
        style={{ background: "var(--marinho)", borderColor: "var(--sidebar-border)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size={28} tone="negative" />
            <div className="flex items-center gap-6">
              <a href="/privacidade" className="lp-navlink text-xs">
                Política de privacidade
              </a>
              <a href="/termos" className="lp-navlink text-xs">
                Termos de uso
              </a>
              <a href="mailto:contato@comproved.com.br" className="lp-navlink text-xs">
                Contato
              </a>
            </div>
          </div>
          <p className="mt-6 text-xs text-center sm:text-left" style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}>
            © {new Date().getFullYear()} Comproved. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
