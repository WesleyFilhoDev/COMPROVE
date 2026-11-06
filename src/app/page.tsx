import Link from "next/link";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/landing/mobile-nav";
import { VerifyDemo } from "@/components/landing/verify-demo";
import { ScrollRevealInit } from "@/components/landing/scroll-reveal-init";

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronDown({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function StatusBadge({ status, children }: { status: "assinado" | "pendente"; children: React.ReactNode }) {
  return <span className={`cpv-badge cpv-badge--${status}`}>{children}</span>;
}

function VerificationSeal({ code, issuedAt, signatures }: { code: string; issuedAt: string; signatures: string }) {
  return (
    <div style={{ padding: "16px 20px", border: "1px solid var(--success-border)", borderRadius: "var(--radius-lg)", background: "var(--success-soft)", display: "flex", flexWrap: "wrap", gap: "12px 24px", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: "var(--radius-full)", background: "var(--success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--success)" }}>DOCUMENTO VÁLIDO</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--success)" }}>{code}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 12, color: "var(--success)" }}>{issuedAt}</span>
        <span style={{ fontSize: 12, color: "var(--success)" }}>{signatures}</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "var(--marinho)", color: "var(--foreground)", fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: "20px", overflowX: "hidden" }}>
      <ScrollRevealInit />
      <div style={{ background: "var(--background)" }}>

        {/* ── 1 · Header + Hero ── */}
        <div className="lp-grid-bg">
          <header style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <a href="#topo" aria-label="Comproved, início" style={{ display: "inline-flex", textDecoration: "none", borderRadius: "var(--radius-md)" }}>
              <Logo size={26} tone="negative" />
            </a>
            {/* Desktop nav */}
            <nav aria-label="Principal" className="lp-desktop-nav" style={{ flexWrap: "wrap", alignItems: "center", gap: 20 }}>
              <a className="lp-navlink lp-navlink--dark" href="#problema">O problema</a>
              <a className="lp-navlink lp-navlink--dark" href="#como-funciona">Como funciona</a>
              <a className="lp-navlink lp-navlink--dark" href="#relatorios">Relatórios</a>
              <a className="lp-navlink lp-navlink--dark" href="#verificacao">Verificação</a>
              <a className="lp-navlink lp-navlink--dark" href="#perguntas">Perguntas</a>
              <Link href="/login" className="lp-navlink lp-navlink--dark">Entrar</Link>
              <Link href="/cadastro" className="cpv-btn cpv-btn--secondary cpv-btn--sm">Criar conta</Link>
            </nav>
            {/* Mobile nav */}
            <div className="lp-mobile-nav">
              <MobileNav />
            </div>
          </header>

          {/* Hero */}
          <section id="topo" style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 96px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "center" }}>
            <div style={{ flex: "1 1 500px", minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
              <div className="hero-animate" style={{ animationDelay: "0ms" }}><Logo size={56} tone="negative" /></div>
              <h1 className="hero-animate lp-hero-title" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 48, lineHeight: "56px", fontWeight: 800, letterSpacing: "-0.025em", color: "#FFFFFF", maxWidth: 560, animationDelay: "80ms" }}>
                Treinamento dado é treinamento{" "}
                <span style={{ color: "var(--azul-sinal)", whiteSpace: "nowrap" }}>
                  comprovado
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "-4px", marginLeft: 6 }}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </h1>
              <p className="hero-animate lp-hero-subtitle" style={{ margin: 0, fontSize: 18, lineHeight: "28px", color: "var(--sidebar-foreground)", maxWidth: 540, animationDelay: "160ms" }}>
                O Comproved registra quem ministrou, quem recebeu, a data e o horário de cada treinamento, coleta a assinatura dos dois lados e entrega um comprovante que qualquer pessoa pode conferir.
              </p>
              <div className="hero-animate lp-hero-cta" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, animationDelay: "240ms" }}>
                <Link href="/cadastro" className="cpv-btn cpv-btn--secondary cpv-btn--lg lp-hero-cta-btn">Criar conta</Link>
                <a href="#como-funciona" className="lp-link-dark lp-hero-cta-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 2px", fontSize: 15 }}>
                  Ver como funciona
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
              <div className="hero-animate" style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 8, animationDelay: "320ms" }}>
                {["quem ministrou", "quem recebeu", "data", "horário", "assinaturas"].map((tag) => (
                  <span key={tag} style={{ height: 28, padding: "0 12px", display: "inline-flex", alignItems: "center", borderRadius: "var(--radius-full)", border: "1px solid var(--sidebar-border)", background: "var(--sidebar-accent)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brand-300)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div className="hero-animate lp-hero-card-col" style={{ flex: "1 1 460px", minWidth: 0, position: "relative", padding: "36px 0 44px 16px", boxSizing: "border-box", animationDelay: "200ms" }}>
              <div style={{ background: "var(--card)", color: "var(--card-foreground)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)" }}>Comprovante</span>
                  <StatusBadge status="assinado">Assinado</StatusBadge>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 18, lineHeight: "26px", fontWeight: 600 }}>Módulo de Estoque — Turma B</h2>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: "16px", color: "var(--muted-foreground)" }}>04/11/2026 · 14:00–16:00 · Distribuidora Aurora</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: "var(--muted-foreground)" }}>O participante declara ter recebido o treinamento na data e no horário indicados.</p>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  {[
                    { name: "Carlos Lima", role: "Instrutor", signedAt: "04/11 16:02" },
                    { name: "Ana Souza", role: "Participante", signedAt: "04/11 16:10" },
                    { name: "Bruno Reis", role: "Participante", signedAt: "05/11 10:14" },
                  ].map((s) => (
                    <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span>
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{s.role}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "var(--success)", display: "inline-flex" }}><CheckIcon size={14} /></span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>{s.signedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <VerificationSeal code="CPV-2026-000184" issuedAt="05/11/2026 às 10:14" signatures="3 de 3 assinaturas coletadas" />
              </div>
              {/* Toast: Bruno signed */}
              <div style={{ position: "absolute", top: 0, right: 16, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--card)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "var(--success-soft)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                <span style={{ fontSize: 13, lineHeight: "18px", fontWeight: 600 }}>Bruno Reis assinou</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>10:14</span>
              </div>
              {/* Toast: document generated */}
              <div style={{ position: "absolute", bottom: 0, left: 0, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--card)", border: "1px solid var(--info-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "var(--info-soft)", color: "var(--info)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m9 15 2 2 4-4" /></svg>
                </span>
                <span style={{ fontSize: 13, lineHeight: "18px", fontWeight: 600 }}>Comprovante gerado</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--link)" }}>CPV-2026-000184</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── 2 · Anatomia ── */}
        <section aria-labelledby="s-anatomia" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px", display: "flex", flexDirection: "column", gap: 32 }}>
            <h2 id="s-anatomia" style={{ margin: 0, fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
              Cinco informações que encerram qualquer discussão
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 0, border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
              {[
                { label: "Quem ministrou", value: "Carlos Lima · Instrutor", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, accent: false },
                { label: "Quem recebeu", value: "Ana Souza, Bruno Reis", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, accent: false },
                { label: "Data", value: "04/11/2026", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>, accent: false },
                { label: "Horário", value: "14:00–16:00", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, accent: false },
                { label: "Assinaturas", value: "3 de 3 · 05/11 10:14", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" /></svg>, accent: true },
              ].map((item, i) => (
                <div
                  key={item.label}
                  data-reveal=""
                  className="lp-anatomy-item"
                  style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10, borderRight: i < 4 ? "1px solid var(--border)" : undefined, background: item.accent ? "var(--accent)" : undefined, "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
                >
                  <span style={{ color: item.accent ? "var(--primary)" : "var(--marinho)", display: "inline-flex" }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: item.accent ? "var(--accent-foreground)" : "var(--muted-foreground)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3 · O Problema ── */}
        <section id="problema" aria-labelledby="s-problema" className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexDirection: "column", gap: 56 }}>
          <div data-reveal="" style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
            <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)" }}>O problema</span>
            <h2 id="s-problema" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>
              O treinamento aconteceu. Um mês depois, ninguém consegue provar.
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>Uma história que toda equipe de implantação conhece.</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "stretch" }}>
            <ol style={{ flex: "1 1 520px", minWidth: 0, margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
              {[
                { ts: "04/11 · 14:00", title: "O treinamento acontece", desc: "Duas horas de Módulo de Estoque com a equipe do cliente.", color: "var(--marinho)", warning: false, quote: undefined },
                { ts: "04/11 · 16:05", title: "A lista de presença vai para a gaveta", desc: "Ou vira uma foto no celular do instrutor.", color: "var(--marinho)", warning: false, quote: undefined },
                { ts: "03/12 · 09:12", title: "O cliente abre um chamado", desc: undefined, color: "var(--warning)", warning: true, quote: '"Ninguém da nossa equipe recebeu treinamento no módulo de estoque."' },
                { ts: "03/12 · 15:40", title: "A busca começa", desc: "Todo mundo procura e-mail, foto, planilha. Nada tem data, nome e assinatura no mesmo lugar.", color: "var(--warning)", warning: true, quote: undefined },
                { ts: "04/12 · 10:30", title: "O treinamento é refeito", desc: "Sem prova do que foi feito, o cliente ganha razão.", color: "var(--destructive)", warning: true, quote: undefined },
              ].map((item, i) => (
                <li key={i} data-reveal="" style={{ display: "flex", gap: 20, "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: 16 }}>
                    <span style={{ width: 12, height: 12, marginTop: 4, borderRadius: 6, background: item.color }}></span>
                    {i < 4 && <span style={{ flex: 1, width: 2, background: "var(--border)" }}></span>}
                  </div>
                  <div style={{ paddingBottom: 28, display: "flex", flexDirection: "column", gap: item.quote ? 8 : 4 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: item.warning ? item.color : "var(--muted-foreground)" }}>{item.ts}</span>
                    <span style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600 }}>{item.title}</span>
                    {item.quote && (
                      <span style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: "var(--radius-lg)", background: "var(--card)", border: "1px solid var(--border)", fontSize: 14, lineHeight: "20px" }}>{item.quote}</span>
                    )}
                    {item.desc && <span style={{ color: "var(--muted-foreground)" }}>{item.desc}</span>}
                  </div>
                </li>
              ))}
            </ol>

            <div data-reveal="" style={{ flex: "1 1 320px", minWidth: 0, padding: "32px 28px", borderRadius: "var(--radius-xl)", background: "var(--marinho)", color: "#FFFFFF", display: "flex", flexDirection: "column", gap: 24, alignSelf: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--azul-sinal)" }}>Com o Comproved</span>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, lineHeight: "28px", fontWeight: 700 }}>O comprovante existe desde o fim da aula</h3>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["Data e horário exatos", "Quem ministrou e quem recebeu", "Assinatura de todos os lados", "Código de verificação público"].map((item) => (
                  <li key={item} style={{ display: "flex", gap: 10, color: "var(--sidebar-foreground)" }}>
                    <span style={{ color: "var(--azul-sinal)", display: "inline-flex" }}><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="cpv-btn cpv-btn--secondary" style={{ justifyContent: "center" }}>
                Criar conta grátis
              </Link>
            </div>
          </div>
        </section>

        {/* ── 4 · Como funciona ── */}
        <section id="como-funciona" aria-labelledby="s-como" className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexDirection: "column", gap: 72 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
            <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)" }}>Como funciona</span>
            <h2 id="s-como" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>
              Quatro passos entre o fim da aula e o comprovante na mão
            </h2>
          </div>

          {/* Step 1 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center" }}>
            <div data-reveal="" style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, background: "var(--marinho)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>01</span>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Registro</span>
              </span>
              <h3 className="lp-step-h3" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, lineHeight: "36px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>O instrutor registra o treinamento</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>Tipo, cliente, data, horário e participantes, numa tela só. Os tipos de treinamento são definidos pelo gestor da conta, então todo mundo registra do mesmo jeito.</p>
            </div>
            <div aria-hidden="true" style={{ flex: "1 1 520px", minWidth: 0, padding: 32, borderRadius: "var(--radius-xl)", background: "var(--secondary)", boxSizing: "border-box" }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: "28px", fontWeight: 700, color: "var(--marinho)" }}>Novo treinamento</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  {[
                    { label: "Tipo", value: "Módulo de Estoque", hasChevron: true, mono: false, focused: false },
                    { label: "Cliente", value: "Distribuidora Aurora", hasChevron: false, mono: false, focused: false },
                    { label: "Data", value: "04/11/2026", hasChevron: false, mono: true, focused: false },
                    { label: "Horário", value: "14:00–16:00", hasChevron: false, mono: true, focused: true },
                  ].map((f) => (
                    <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontWeight: 500 }}>{f.label}</span>
                      <span style={{ height: 40, padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${f.focused ? "var(--ring)" : "var(--input)"}`, boxShadow: f.focused ? "var(--focus-halo)" : undefined, borderRadius: "var(--radius-md)", fontFamily: f.mono ? "var(--font-mono)" : undefined, fontSize: f.mono ? 13 : undefined }}>
                        {f.value}
                        {f.hasChevron && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}><path d="m6 9 6 6 6-6" /></svg>}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontWeight: 500 }}>Participantes</span>
                  <div style={{ minHeight: 40, padding: 6, display: "flex", flexWrap: "wrap", gap: 6, border: "1px solid var(--input)", borderRadius: "var(--radius-md)", boxSizing: "border-box" }}>
                    {["Ana Souza", "Bruno Reis", "Marina Prado"].map((name) => (
                      <span key={name} style={{ height: 28, padding: "0 10px", display: "inline-flex", alignItems: "center", borderRadius: "var(--radius-full)", background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 13, fontWeight: 500 }}>{name}</span>
                    ))}
                  </div>
                </div>
                <div className="lp-step1-btns" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <span className="cpv-btn cpv-btn--outline cpv-btn--sm">Salvar rascunho</span>
                  <span className="cpv-btn cpv-btn--primary cpv-btn--sm">Enviar para assinatura</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="lp-step-flip" style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center" }}>
            <div aria-hidden="true" style={{ flex: "1 1 520px", minWidth: 0, padding: 32, borderRadius: "var(--radius-xl)", background: "var(--marinho)", boxSizing: "border-box" }}>
              <div style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4, fontSize: 13, lineHeight: "18px" }}>
                  <span style={{ color: "var(--muted-foreground)" }}>De <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>Comproved</strong> · em nome de Software Exemplo</span>
                  <span style={{ color: "var(--muted-foreground)" }}>Para <span style={{ color: "var(--foreground)" }}>ana.souza@aurora.com.br</span></span>
                  <span style={{ fontSize: 15, lineHeight: "22px", fontWeight: 600, color: "var(--foreground)" }}>Confirme o treinamento Módulo de Estoque — Turma B</span>
                </div>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <Logo size={20} />
                  <p style={{ margin: 0, fontSize: 15, lineHeight: "24px" }}>
                    Olá, Ana. Carlos Lima registrou o treinamento que você recebeu em{" "}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>04/11/2026</span>, das{" "}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>14:00</span> às{" "}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>16:00</span>. Revise os dados e confirme com a sua assinatura.
                  </p>
                  <span className="cpv-btn cpv-btn--primary" style={{ alignSelf: "flex-start" }}>Revisar e assinar</span>
                  <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--muted-foreground)" }}>Você não precisa criar conta para assinar.</span>
                </div>
              </div>
            </div>
            <div data-reveal="" style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, background: "var(--marinho)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>02</span>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Envio</span>
              </span>
              <h3 className="lp-step-h3" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, lineHeight: "36px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>Cada participante recebe o seu link</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>Um e-mail com os dados do treinamento e um botão para assinar. Quem não assinou recebe lembrete, e você acompanha a contagem em tempo real: Pendente · 2 de 3.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center" }}>
            <div data-reveal="" style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, background: "var(--marinho)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>03</span>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Assinatura</span>
              </span>
              <h3 className="lp-step-h3" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, lineHeight: "36px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>Assinam pelo celular, sem criar conta</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>O participante confere o que recebeu, confirma e assina com o dedo. O instrutor assina do mesmo jeito. Cada assinatura guarda data e horário.</p>
            </div>
            <div aria-hidden="true" style={{ flex: "1 1 520px", minWidth: 0, padding: "40px 32px", borderRadius: "var(--radius-xl)", background: "var(--secondary)", display: "flex", justifyContent: "center", boxSizing: "border-box" }}>
              <div style={{ width: 300, maxWidth: "100%", padding: 10, borderRadius: 44, background: "var(--graphite-900)", boxShadow: "var(--shadow-lg)", boxSizing: "border-box" }}>
                <div style={{ borderRadius: 36, background: "var(--card)", padding: "28px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "center" }}><Logo size={20} /></div>
                  <span style={{ fontSize: 11, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)", textAlign: "center" }}>Confirmação de treinamento</span>
                  <div style={{ padding: 12, borderRadius: "var(--radius-lg)", background: "var(--muted)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Módulo de Estoque — Turma B</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>04/11/2026 · 14:00–16:00</span>
                    <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--muted-foreground)" }}>Instrutor: Carlos Lima</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, lineHeight: "18px" }}>
                    <span style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 4, background: "var(--primary)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    Confirmo que recebi o treinamento descrito acima.
                  </div>
                  <div style={{ height: 96, border: "1px dashed var(--graphite-400)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <svg width="170" height="56" viewBox="0 0 170 56" fill="none" stroke="#0B1B3F" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 40c10-22 18-30 22-24s-8 26-2 26 14-30 20-28-4 22 2 22 10-14 16-14 2 12 8 12 12-18 20-18 0 14 8 14 16-8 26-10 18-2 32-4" />
                    </svg>
                    <span style={{ position: "absolute", left: 12, bottom: 8, fontSize: 11, color: "var(--muted-foreground)" }}>Assine aqui</span>
                  </div>
                  <span className="cpv-btn cpv-btn--primary cpv-btn--lg" style={{ width: "100%", justifyContent: "center" }}>Assinar comprovante</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="lp-step-flip" style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center" }}>
            <div aria-hidden="true" style={{ flex: "1 1 520px", minWidth: 0, padding: 32, borderRadius: "var(--radius-xl)", background: "var(--marinho)", boxSizing: "border-box" }}>
              <div style={{ background: "var(--card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", padding: 32, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <Logo size={22} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>CPV-2026-000184</span>
                </div>
                <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Comprovante de treinamento</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["92%", "78%", "85%"].map((w, i) => (
                    <span key={i} style={{ height: 10, width: w, borderRadius: 5, background: "var(--muted)" }}></span>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                  {[["Carlos Lima", "Instrutor"], ["Ana Souza", "Participante"], ["Bruno Reis", "Participante"]].map(([name, role]) => (
                    <span key={name} style={{ paddingTop: 20, borderTop: "1px solid var(--graphite-300)", fontSize: 11, lineHeight: "14px", color: "var(--muted-foreground)" }}>
                      {name}<br />{role}
                    </span>
                  ))}
                </div>
                <VerificationSeal code="CPV-2026-000184" issuedAt="05/11/2026 às 10:14" signatures="3 de 3 assinaturas coletadas" />
              </div>
            </div>
            <div data-reveal="" style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, background: "var(--primary)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>04</span>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Comprovante</span>
              </span>
              <h3 className="lp-step-h3" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, lineHeight: "36px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>O PDF sai pronto, com selo e código</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>
                Quando a última assinatura chega, o comprovante é gerado com todas as assinaturas, o código{" "}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>CPV</span> e o QR Code para verificação. Baixe, envie ao cliente ou anexe ao contrato.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5 · Papéis ── */}
        <section aria-labelledby="s-papeis" className="lp-grid-bg">
          <div className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexDirection: "column", gap: 48 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--azul-sinal)" }}>Um acesso para cada papel</span>
              <h2 id="s-papeis" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "#FFFFFF" }}>Cada pessoa vê só o que precisa</h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--sidebar-foreground)" }}>Um login só. O Comproved reconhece quem está entrando e abre a tela certa.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {[
                { initials: "GC", bg: undefined, color: undefined, title: "Gestor da conta", subtitle: "Quem coordena a equipe", items: ["Convida instrutores por e-mail", "Define os tipos de treinamento", "Vê todos os comprovantes e relatórios"] },
                { initials: "CL", bg: "var(--azul-sinal)", color: "var(--marinho)", title: "Instrutor", subtitle: "Quem ministra o treinamento", items: ["Registra o treinamento ao terminar", "Envia para assinatura e assina junto", "Acompanha quem ainda falta assinar"] },
                { initials: "AS", bg: undefined, color: undefined, title: "Participante", subtitle: "Quem recebe o treinamento", items: ["Recebe o link por e-mail", "Assina sem criar conta", "Recebe uma cópia do comprovante"] },
              ].map((role, i) => (
                <div key={role.title} data-reveal="" style={{ padding: 28, borderRadius: "var(--radius-xl)", background: "var(--sidebar-accent)", border: "1px solid var(--sidebar-border)", display: "flex", flexDirection: "column", gap: 20, "--reveal-delay": `${i * 100}ms` } as React.CSSProperties}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="cpv-avatar" style={{ width: 44, height: 44, fontSize: 14, background: role.bg, color: role.color }}>{role.initials}</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: "28px", fontWeight: 700, color: "#FFFFFF" }}>{role.title}</span>
                      <span style={{ fontSize: 13, color: "var(--sidebar-foreground)" }}>{role.subtitle}</span>
                    </div>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, color: "var(--sidebar-foreground)" }}>
                    {role.items.map((item) => (
                      <li key={item} style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: "var(--azul-sinal)", display: "inline-flex" }}><CheckIcon /></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6 · Relatórios ── */}
        <section id="relatorios" aria-labelledby="s-relatorios" className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "center" }}>
          <div data-reveal="" style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)" }}>Relatório mensal</span>
            <h2 id="s-relatorios" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>O fechamento do mês já vem pronto</h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>Treinamentos por cliente, por instrutor e por tipo, com o que está assinado e o que está pendente. Exporte em PDF ou CSV para a diretoria ou para o cliente.</p>
            <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 15 }}>
              {["Filtro por período, cliente e instrutor", "Pendências com um clique para lembrar", "Exportação em PDF e CSV"].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--primary)", display: "inline-flex" }}><CheckIcon /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal="" style={{ flex: "1 1 600px", minWidth: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600 }}>Treinamentos por mês</span>
                <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--muted-foreground)" }}>Jun–Nov 2026 · exemplo</span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, lineHeight: "16px", color: "var(--muted-foreground)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--chart-4)" }}></span>Assinados</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--chart-5)" }}></span>Pendentes</span>
              </div>
            </div>
            <div
              className="lp-chart"
              role="img"
              aria-label="Gráfico de barras: junho 20, julho 25, agosto 26, setembro 35, outubro 39, novembro 48 treinamentos."
              style={{ padding: "24px 24px 16px", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 16, alignItems: "end", height: 240, boxSizing: "border-box", backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px)", backgroundSize: "100% 52px", backgroundPosition: "0 -8px" }}
            >
              {[
                { signed: 58, pending: 7, label: null },
                { signed: 70, pending: 10, label: null },
                { signed: 80, pending: 4, label: null },
                { signed: 99, pending: 13, label: null },
                { signed: 115, pending: 10, label: null },
                { signed: 131, pending: 22, label: "48" },
              ].map((col, i) => (
                <div key={i} className="lp-col" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
                  {col.label && <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>{col.label}</span>}
                  <span style={{ width: "60%", height: col.pending, borderRadius: "4px 4px 0 0", background: "var(--chart-5)" }}></span>
                  <span style={{ width: "60%", height: col.signed, background: "var(--chart-4)" }}></span>
                </div>
              ))}
            </div>
            <div aria-hidden="true" style={{ padding: "0 24px 16px", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 16, fontSize: 12, lineHeight: "16px", color: "var(--muted-foreground)", textAlign: "center", borderTop: "1px solid var(--graphite-300)" }}>
              {["Jun", "Jul", "Ago", "Set", "Out", "Nov"].map((m) => (
                <span key={m} style={{ paddingTop: 8 }}>{m}</span>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 440, borderCollapse: "collapse", fontSize: 14, lineHeight: "20px", fontVariantNumeric: "tabular-nums" }}>
                <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Treinamentos de novembro por instrutor</caption>
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    <th scope="col" style={{ height: 40, padding: "0 24px", textAlign: "left", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Instrutor</th>
                    <th scope="col" style={{ height: 40, padding: "0 12px", textAlign: "right", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Novembro</th>
                    <th scope="col" style={{ height: 40, padding: "0 24px 0 12px", textAlign: "left", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Carlos Lima", count: 18, status: "assinado" as const, label: "Assinado · 18 de 18" },
                    { name: "Marina Prado", count: 16, status: "pendente" as const, label: "Pendente · 3 de 16" },
                    { name: "João Alves", count: 14, status: "pendente" as const, label: "Pendente · 4 de 14" },
                  ].map((row) => (
                    <tr key={row.name} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ height: 56, padding: "0 24px", fontWeight: 500 }}>{row.name}</td>
                      <td style={{ padding: "0 12px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13 }}>{row.count}</td>
                      <td style={{ padding: "0 24px 0 12px" }}><StatusBadge status={row.status}>{row.label}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 7 · Verificação pública ── */}
        <section id="verificacao" aria-labelledby="s-verif" style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "center" }}>
            <div style={{ flex: "1 1 560px", minWidth: 0, border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", overflow: "hidden", background: "var(--background)" }}>
              <div aria-hidden="true" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <span style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((i) => <span key={i} style={{ width: 10, height: 10, borderRadius: 5, background: "var(--graphite-300)" }}></span>)}
                </span>
                <span style={{ flex: 1, height: 28, padding: "0 12px", display: "flex", alignItems: "center", gap: 8, borderRadius: "var(--radius-md)", background: "var(--card)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  [SEU DOMÍNIO]/verificar
                </span>
              </div>
              <VerifyDemo />
            </div>
            <div data-reveal="" style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)" }}>Verificação pública</span>
              <h2 id="s-verif" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>Qualquer pessoa confere. Sem login, sem ligação.</h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>O cliente, o auditor ou o jurídico digitam o código ou leem o QR Code e veem quem assinou e quando. Experimente ao lado.</p>
            </div>
          </div>
        </section>

        {/* ── 8 · Trilha de registro ── */}
        <section aria-labelledby="s-trilha" className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)" }}>Transparência</span>
            <h2 id="s-trilha" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>Cada passo fica registrado, com data e hora</h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>Do registro à última assinatura, o histórico de cada comprovante mostra quem fez o quê e quando. Nada é apagado.</p>
          </div>
          <div data-reveal="" style={{ flex: "1 1 560px", minWidth: 0, background: "var(--graphite-900)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 8, borderBottom: "1px solid var(--graphite-700)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>CPV-2026-000184 · histórico</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--graphite-300)" }}>7 eventos</span>
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: "20px" }}>
              {[
                { ts: "04/11/2026 14:02", text: "Treinamento registrado por Carlos Lima", color: "#FFFFFF", weight: undefined },
                { ts: "04/11/2026 16:00", text: "Enviado para 3 participantes", color: "var(--brand-300)", weight: undefined },
                { ts: "04/11/2026 16:02", text: "Carlos Lima assinou · instrutor", color: "#3FCF8E", weight: undefined },
                { ts: "04/11/2026 16:10", text: "Ana Souza assinou · participante", color: "#3FCF8E", weight: undefined },
                { ts: "05/11/2026 09:30", text: "Lembrete enviado para Bruno Reis", color: "#F2B44B", weight: undefined },
                { ts: "05/11/2026 10:14", text: "Bruno Reis assinou · participante", color: "#3FCF8E", weight: undefined },
                { ts: "05/11/2026 10:14", text: "Comprovante gerado", color: "#FFFFFF", weight: 600 },
              ].map((event, i) => (
                <li key={i} style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", padding: "8px 0" }}>
                  <span style={{ color: "var(--graphite-300)", width: 128 }}>{event.ts}</span>
                  <span style={{ color: event.color, fontWeight: event.weight }}>{event.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 9 · Segurança ── */}
        <section id="seguranca" aria-labelledby="s-seguranca" className="lp-grid-bg">
          <div className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexDirection: "column", gap: 48 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--azul-sinal)" }}>Segurança e controle</span>
              <h2 id="s-seguranca" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "#FFFFFF" }}>Os dados da sua empresa, sob o seu controle</h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--sidebar-foreground)" }}>Cada empresa tem a própria conta, com os seus instrutores, clientes e comprovantes. Quem é de fora não vê o que é seu.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "stretch" }}>
              <div style={{ flex: "1 1 560px", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[
                  { title: "Um login por pessoa", desc: "Cada pessoa entra com o próprio e-mail, e o Comproved abre a tela do papel dela.", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
                  { title: "Acesso por papel", desc: "O instrutor vê os próprios treinamentos. O gestor vê a equipe inteira.", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
                  { title: "Senhas protegidas", desc: "As senhas são guardadas com criptografia e não ficam visíveis para ninguém.", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
                  { title: "Convite e recuperação por e-mail", desc: "O instrutor define a própria senha no convite. Esqueceu? Um link por e-mail resolve.", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg> },
                ].map((card, i) => (
                  <div key={card.title} data-reveal="" style={{ padding: 24, borderRadius: "var(--radius-xl)", background: "var(--sidebar-accent)", border: "1px solid var(--sidebar-border)", display: "flex", flexDirection: "column", gap: 12, "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
                    <span style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--marinho)", color: "var(--azul-sinal)", display: "flex", alignItems: "center", justifyContent: "center" }}>{card.icon}</span>
                    <h3 style={{ margin: 0, fontSize: 16, lineHeight: "24px", fontWeight: 600, color: "#FFFFFF" }}>{card.title}</h3>
                    <p style={{ margin: 0, color: "var(--sidebar-foreground)" }}>{card.desc}</p>
                  </div>
                ))}
              </div>
              <div aria-hidden="true" style={{ flex: "1 1 340px", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 380, background: "var(--card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", padding: 32, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "center" }}><Logo size={22} /></div>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: "28px", fontWeight: 700, color: "var(--marinho)", textAlign: "center" }}>Entrar no Comproved</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontWeight: 500 }}>E-mail</span>
                    <span style={{ height: 40, padding: "0 12px", display: "flex", alignItems: "center", border: "1px solid var(--input)", borderRadius: "var(--radius-md)" }}>ana.lima@empresa.com.br</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontWeight: 500 }}>Senha</span>
                    <span style={{ height: 40, padding: "0 12px", display: "flex", alignItems: "center", border: "1px solid var(--ring)", boxShadow: "var(--focus-halo)", borderRadius: "var(--radius-md)", letterSpacing: "0.2em" }}>••••••••••</span>
                  </div>
                  <span className="cpv-btn cpv-btn--primary cpv-btn--lg" style={{ width: "100%", justifyContent: "center" }}>Entrar</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 12px", borderRadius: "var(--radius-md)", background: "var(--success-soft)", border: "1px solid var(--success-border)", color: "var(--success)", fontSize: 13, lineHeight: "18px", fontWeight: 600 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    Perfil identificado: Gestor da conta
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10 · Para quem é ── */}
        <section aria-labelledby="s-quem" style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", display: "flex", flexDirection: "column", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)" }}>Para quem é</span>
              <h2 id="s-quem" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, lineHeight: "36px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>Feito para quem treina gente toda semana</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
              {[
                { title: "Empresas de software", desc: "Implantação e treinamento de sistemas, com registro por cliente e por módulo." },
                { title: "Consultorias", desc: "Capacitações entregues em campo e comprovadas no mesmo dia." },
                { title: "RH e treinamento interno", desc: "Integrações e reciclagens com histórico por colaborador." },
                { title: "Fornecedores de equipamentos", desc: "Treinamento de operação registrado na entrega de cada equipamento." },
              ].map((item, i) => (
                <div key={item.title} data-reveal="" style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 20, borderTop: "2px solid var(--marinho)", "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
                  <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, lineHeight: "28px", fontWeight: 700, color: "var(--marinho)" }}>{item.title}</h3>
                  <p style={{ margin: 0, color: "var(--muted-foreground)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 11 · Perguntas ── */}
        <section id="perguntas" aria-labelledby="s-faq" style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "flex-start" }}>
            <div data-reveal="" style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)" }}>Perguntas frequentes</span>
              <h2 id="s-faq" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--marinho)" }}>Antes de criar sua conta</h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>
                Não achou sua dúvida? Fale com a gente em{" "}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>contato@comproved.com.br</span>.
              </p>
            </div>
            <div className="lp-faq" style={{ flex: "1 1 620px", minWidth: 0, display: "flex", flexDirection: "column", borderTop: "1px solid var(--border)" }}>
              {[
                { q: "O participante precisa criar uma conta para assinar?", a: "Não. Ele recebe um link por e-mail, confere os dados do treinamento e assina pelo navegador do celular ou do computador." },
                { q: "O que fica registrado em cada comprovante?", a: "Quem ministrou, quem recebeu, o tipo de treinamento, a data, o horário e o momento de cada assinatura, além do código de verificação." },
                { q: "E se um participante não assinar?", a: "O comprovante fica como Pendente e mostra quantas assinaturas faltam. Você envia um lembrete quando quiser, e o histórico registra cada envio." },
                { q: "Quem pode cadastrar instrutores e tipos de treinamento?", a: "O gestor da conta. Ele convida os instrutores por e-mail, e cada um define a própria senha no primeiro acesso." },
                { q: "Consigo exportar os dados?", a: "Sim. Cada comprovante sai em PDF, e o relatório mensal pode ser exportado em PDF ou CSV." },
                { q: "Dá para usar com vários clientes?", a: "Sim. Cada treinamento fica ligado a um cliente, e o relatório mensal separa tudo por cliente e por instrutor." },
              ].map((faq) => (
                <details key={faq.q} style={{ borderBottom: "1px solid var(--border)", padding: "20px 0" }}>
                  <summary style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 16, lineHeight: "24px", fontWeight: 600 }}>
                    {faq.q}<ChevronDown />
                  </summary>
                  <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 12 · CTA ── */}
        <section id="criar-conta" aria-labelledby="s-conta" className="lp-grid-bg">
          <div className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "center" }}>
            <div data-reveal="" style={{ flex: "1 1 480px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--azul-sinal)" }}>Comece agora</span>
              <h2 id="s-conta" className="lp-section-h2" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.025em", color: "#FFFFFF" }}>
                Crie a conta da sua empresa e comprove o próximo treinamento
              </h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--sidebar-foreground)", maxWidth: 520 }}>
                Você entra como gestor da conta, cadastra os tipos de treinamento e convida os instrutores. O próximo treinamento já sai com comprovante.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, paddingTop: 8 }}>
                <Link href="/cadastro" className="cpv-btn cpv-btn--primary cpv-btn--lg">
                  Criar conta
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
                <Link href="/login" className="lp-link-dark" style={{ padding: "10px 2px", fontSize: 15 }}>Já tem conta? Entrar</Link>
              </div>
            </div>

            <div data-reveal="" style={{ flex: "1 1 420px", minWidth: 0, maxWidth: 520, background: "var(--card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", padding: 32, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, lineHeight: "28px", fontWeight: 700, color: "var(--marinho)" }}>Seus primeiros passos</h3>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>1 de 4</span>
              </div>
              <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
                <span style={{ height: 4, borderRadius: 2, background: "var(--success)" }}></span>
                {[0, 1, 2].map((i) => <span key={i} style={{ height: 4, borderRadius: 2, background: "var(--muted)" }}></span>)}
              </div>
              <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
                {[
                  { step: null, done: true, label: "Criar a conta da empresa", sub: "Seus dados e os da sua equipe", badge: "Concluído" },
                  { step: "2", done: false, label: "Cadastrar os tipos de treinamento", sub: "Módulos, integrações, reciclagens", badge: null },
                  { step: "3", done: false, label: "Convidar os instrutores", sub: "Cada um define a própria senha", badge: null },
                  { step: "4", done: false, label: "Registrar o primeiro treinamento", sub: "E gerar o primeiro comprovante", badge: null },
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "center", minHeight: 56, borderBottom: i < 3 ? "1px solid var(--border)" : undefined }}>
                    {item.done ? (
                      <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 14, background: "var(--success-soft)", border: "1px solid var(--success-border)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </span>
                    ) : (
                      <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 14, border: "1px solid var(--graphite-500)", color: "var(--muted-foreground)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>{item.step}</span>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--muted-foreground)" }}>{item.sub}</span>
                    </div>
                    {item.badge && <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--success)" }}>{item.badge}</span>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── 13 · Fechamento ── */}
        <section aria-label="Slogan" style={{ background: "var(--card)" }}>
          <div data-reveal="" className="lp-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}>
            <Logo size={48} />
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: "44px", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--marinho)", maxWidth: 720 }}>
              Treinamento dado é treinamento <span style={{ color: "var(--primary)" }}>comprovado</span>.
            </p>
            <Link href="/cadastro" className="cpv-btn cpv-btn--outline cpv-btn--lg">Criar conta</Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ background: "var(--marinho)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px 32px", display: "flex", flexDirection: "column", gap: 48 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "space-between" }}>
              <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
                <Logo size={30} tone="negative" />
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, lineHeight: "28px", fontWeight: 700, color: "#FFFFFF" }}>
                  Treinamento dado é treinamento <span style={{ color: "var(--azul-sinal)" }}>comprovado</span>.
                </p>
                <p style={{ margin: 0, color: "var(--sidebar-foreground)" }}>Registro, assinatura e verificação de treinamentos para empresas que treinam clientes e equipes.</p>
              </div>
              <nav aria-label="Rodapé" style={{ flex: "2 1 480px", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 32 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--azul-sinal)" }}>Produto</span>
                  <a className="lp-navlink lp-navlink--dark" href="#como-funciona" style={{ padding: "4px 0" }}>Como funciona</a>
                  <a className="lp-navlink lp-navlink--dark" href="#relatorios" style={{ padding: "4px 0" }}>Relatórios</a>
                  <a className="lp-navlink lp-navlink--dark" href="#seguranca" style={{ padding: "4px 0" }}>Segurança</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--azul-sinal)" }}>Comprovantes</span>
                  <a className="lp-navlink lp-navlink--dark" href="#verificacao" style={{ padding: "4px 0" }}>Verificar um comprovante</a>
                  <a className="lp-navlink lp-navlink--dark" href="#perguntas" style={{ padding: "4px 0" }}>Perguntas frequentes</a>
                  <Link href="/login" className="lp-navlink lp-navlink--dark" style={{ padding: "4px 0" }}>Entrar na conta</Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--azul-sinal)" }}>Contato</span>
                  <Link href="/cadastro" className="lp-navlink lp-navlink--dark" style={{ padding: "4px 0" }}>Criar conta</Link>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: "20px", color: "var(--sidebar-foreground)", padding: "4px 0" }}>contato@comproved.com.br</span>
                </div>
              </nav>
            </div>
            <div style={{ paddingTop: 24, borderTop: "1px solid var(--sidebar-border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <span style={{ fontSize: 12, lineHeight: "20px", color: "var(--sidebar-foreground)" }}>© 2026 Comproved</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
                <a href="#privacidade" className="lp-navlink lp-navlink--dark">Política de privacidade</a>
                <a href="#termos" className="lp-navlink lp-navlink--dark">Termos de uso</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
