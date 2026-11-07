"use client";

import { useState } from "react";
import Link from "next/link";

const COOLDOWN_DAYS = 30;

type Company = {
  id: string;
  name: string;
  cnpj: string | null;
  nameChangedAt: string | null;
  segment: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCnpj(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatZip(val: string): string {
  const d = val.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function daysUntilAllowed(changedAt: string | null): number | null {
  if (!changedAt) return null;
  const next = new Date(changedAt);
  next.setDate(next.getDate() + COOLDOWN_DAYS);
  const diff = Math.ceil((next.getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : null;
}

async function saveCompanyField(fields: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/profile/company", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (res.ok) return null;
  const data = (await res.json()) as { error: string };
  return data.error ?? "Erro ao salvar.";
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M11.5 1.5a1.42 1.42 0 0 1 2 2l-9 9-2.5.5.5-2.5 9-9Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 4V3a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "var(--azul-eletrico)" }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--tinta)", fontFamily: "var(--font-display)" }}>{title}</h2>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

// ─── EditableField ────────────────────────────────────────────────────────────

function EditableField({
  label,
  value: initialValue,
  onSave,
  cooldownDays = null,
  mono = false,
  placeholder,
}: {
  label: string;
  value: string;
  onSave: (val: string) => Promise<string | null>;
  cooldownDays?: number | null;
  mono?: boolean;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [current, setCurrent] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    if (value.trim() === current) { setEditing(false); return; }
    setError(null);
    setPending(true);
    const err = await onSave(value.trim());
    setPending(false);
    if (err) { setError(err); } else {
      setCurrent(value.trim());
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  const isLocked = cooldownDays !== null;

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {editing ? (
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              placeholder={placeholder}
              onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); if (e.key === "Escape") { setValue(current); setEditing(false); } }}
              style={{ flex: 1, height: 36, padding: "0 12px", border: "1px solid var(--azul-eletrico)", borderRadius: "var(--radius-md)", fontSize: 14, outline: "none", background: "var(--card)", color: "var(--foreground)", fontFamily: mono ? "var(--font-mono)" : undefined }}
            />
            <button onClick={handleSave} disabled={pending || !value.trim()} className="cpv-btn cpv-btn--primary cpv-btn--sm">{pending ? "Salvando…" : "Salvar"}</button>
            <button onClick={() => { setValue(current); setEditing(false); setError(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted-foreground)", padding: "0 8px", height: 36 }}>Cancelar</button>
          </div>
          {error && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--destructive)" }}>{error}</p>}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: current ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: mono && current ? "var(--font-mono)" : undefined }}>
            {current || "Não informado"}
          </span>
          {success && <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>✓ Salvo</span>}
          {isLocked ? (
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Disponível em {cooldownDays} dia{cooldownDays !== 1 ? "s" : ""}</span>
          ) : (
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>
              <PencilIcon /> Editar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ConfiguracoesClient({ company: initial }: { company: Company }) {
  const [company, setCompany] = useState(initial);
  const [nameCooldown, setNameCooldown] = useState(() => daysUntilAllowed(initial.nameChangedAt));

  // CNPJ state
  const [cnpj, setCnpj] = useState(initial.cnpj ? formatCnpj(initial.cnpj) : "");
  const [cnpjEditing, setCnpjEditing] = useState(false);
  const [cnpjPending, setCnpjPending] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjSuccess, setCnpjSuccess] = useState(false);

  // Address state
  const [zipCode, setZipCode] = useState(initial.zipCode ? formatZip(initial.zipCode) : "");
  const [zipFetching, setZipFetching] = useState(false);
  const [addrEditing, setAddrEditing] = useState(false);
  const [addrFields, setAddrFields] = useState({
    street: initial.street ?? "",
    number: initial.number ?? "",
    complement: initial.complement ?? "",
    district: initial.district ?? "",
    city: initial.city ?? "",
    state: initial.state ?? "",
  });
  const [addrPending, setAddrPending] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [addrSuccess, setAddrSuccess] = useState(false);

  async function saveName(name: string): Promise<string | null> {
    const err = await saveCompanyField({ name });
    if (!err) {
      const newChangedAt = new Date().toISOString();
      setCompany((c) => ({ ...c, name }));
      setNameCooldown(daysUntilAllowed(newChangedAt));
    }
    return err;
  }

  async function saveSegment(segment: string): Promise<string | null> {
    const err = await saveCompanyField({ segment: segment || null });
    if (!err) setCompany((c) => ({ ...c, segment: segment || null }));
    return err;
  }

  async function saveCnpj() {
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length !== 14) { setCnpjError("CNPJ deve ter 14 dígitos."); return; }
    setCnpjPending(true); setCnpjError(null);
    const err = await saveCompanyField({ cnpj: digits });
    setCnpjPending(false);
    if (err) { setCnpjError(err); } else {
      setCnpjEditing(false);
      setCnpjSuccess(true);
      setTimeout(() => setCnpjSuccess(false), 3000);
    }
  }

  async function fetchZip(zip: string) {
    const digits = zip.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setZipFetching(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (res.ok) {
        const data = (await res.json()) as { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean };
        if (!data.erro) {
          setAddrFields((f) => ({
            ...f,
            street: data.logradouro ?? f.street,
            district: data.bairro ?? f.district,
            city: data.localidade ?? f.city,
            state: data.uf ?? f.state,
          }));
          setAddrEditing(true);
        }
      }
    } finally {
      setZipFetching(false);
    }
  }

  async function saveAddress() {
    setAddrPending(true); setAddrError(null);
    const digits = zipCode.replace(/\D/g, "");
    const err = await saveCompanyField({
      zipCode: digits || null,
      street: addrFields.street || null,
      number: addrFields.number || null,
      complement: addrFields.complement || null,
      district: addrFields.district || null,
      city: addrFields.city || null,
      state: addrFields.state || null,
    });
    setAddrPending(false);
    if (err) { setAddrError(err); } else {
      setAddrEditing(false);
      setAddrSuccess(true);
      setTimeout(() => setAddrSuccess(false), 3000);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 36,
    padding: "0 12px",
    border: "1px solid var(--azul-eletrico)",
    borderRadius: "var(--radius-md)",
    fontSize: 14,
    outline: "none",
    background: "var(--card)",
    color: "var(--foreground)",
    boxSizing: "border-box",
  };

  const addressSummary = [
    addrFields.street && `${addrFields.street}${addrFields.number ? `, ${addrFields.number}` : ""}`,
    addrFields.complement,
    addrFields.district,
    addrFields.city && addrFields.state ? `${addrFields.city} – ${addrFields.state}` : addrFields.city || addrFields.state,
    zipCode,
  ].filter(Boolean).join(" · ");

  return (
    <div className="flex-1 min-h-screen" style={{ background: "var(--nevoa)" }}>
      {/* Sticky top bar */}
      <div
        className="cpv-topbar"
        style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--card)", borderBottom: "1px solid var(--border)", height: 56, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
      >
        <Link href="/dashboard" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}>
          {company.name}
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <span style={{ color: "var(--azul-eletrico)", fontWeight: 700 }}>Configurações</span>
      </div>

      {/* Page body */}
      <div className="cpv-page" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--tinta)", margin: "0 0 4px" }}>
            Configurações
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>
            Dados da empresa exibidos nos comprovantes de treinamento.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Dados da empresa */}
          <SectionCard title="Dados da empresa" icon={<BuildingIcon />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <EditableField
                label="Nome da empresa"
                value={company.name}
                onSave={saveName}
                cooldownDays={nameCooldown}
              />

              <EditableField
                label="Segmento"
                value={company.segment ?? ""}
                onSave={saveSegment}
                placeholder="ex: Construção civil, Saúde, Indústria…"
              />

              {/* CNPJ */}
              <div>
                <label style={labelStyle}>CNPJ</label>
                {cnpjEditing ? (
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="text"
                        value={cnpj}
                        onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                        onKeyDown={(e) => { if (e.key === "Enter") void saveCnpj(); if (e.key === "Escape") setCnpjEditing(false); }}
                        placeholder="00.000.000/0000-00"
                        autoFocus
                        maxLength={18}
                        style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
                      />
                      <button onClick={saveCnpj} disabled={cnpjPending} className="cpv-btn cpv-btn--primary cpv-btn--sm">
                        {cnpjPending ? "Salvando…" : "Salvar"}
                      </button>
                      <button onClick={() => { setCnpjEditing(false); setCnpjError(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted-foreground)", padding: "0 8px", height: 36 }}>
                        Cancelar
                      </button>
                    </div>
                    {cnpjError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--destructive)" }}>{cnpjError}</p>}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: cnpj ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: cnpj ? "var(--font-mono)" : undefined }}>
                      {cnpj || "Não informado"}
                    </span>
                    {cnpjSuccess && <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>✓ Salvo</span>}
                    {!cnpj && (
                      <span style={{ fontSize: 12, color: "var(--warning)", fontWeight: 600, background: "var(--warning-soft)", padding: "2px 8px", borderRadius: "var(--radius-full)", border: "1px solid var(--warning-border)" }}>
                        Necessário para emitir treinamentos
                      </span>
                    )}
                    <button onClick={() => setCnpjEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>
                      <PencilIcon /> Editar
                    </button>
                  </div>
                )}
              </div>

              {nameCooldown !== null && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", background: "var(--nevoa)", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  Próxima alteração do nome disponível em <strong>{nameCooldown} dia{nameCooldown !== 1 ? "s" : ""}</strong>.
                </p>
              )}
            </div>
          </SectionCard>

          {/* Endereço */}
          <SectionCard title="Endereço" icon={<LocationIcon />}>
            {addrEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* CEP */}
                <div>
                  <label style={labelStyle}>CEP</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(formatZip(e.target.value))}
                      onBlur={() => fetchZip(zipCode)}
                      placeholder="00000-000"
                      maxLength={9}
                      style={{ ...inputStyle, maxWidth: 140, fontFamily: "var(--font-mono)" }}
                    />
                    {zipFetching && <span style={{ fontSize: 13, color: "var(--muted-foreground)", alignSelf: "center" }}>Buscando…</span>}
                  </div>
                </div>

                {/* Logradouro + Número */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Logradouro</label>
                    <input type="text" value={addrFields.street} onChange={(e) => setAddrFields((f) => ({ ...f, street: e.target.value }))} placeholder="Rua, Av, Travessa…" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Número</label>
                    <input type="text" value={addrFields.number} onChange={(e) => setAddrFields((f) => ({ ...f, number: e.target.value }))} placeholder="Nº" style={inputStyle} />
                  </div>
                </div>

                {/* Complemento + Bairro */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Complemento</label>
                    <input type="text" value={addrFields.complement} onChange={(e) => setAddrFields((f) => ({ ...f, complement: e.target.value }))} placeholder="Sala, Andar, Bloco…" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Bairro</label>
                    <input type="text" value={addrFields.district} onChange={(e) => setAddrFields((f) => ({ ...f, district: e.target.value }))} style={inputStyle} />
                  </div>
                </div>

                {/* Cidade + Estado */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Cidade</label>
                    <input type="text" value={addrFields.city} onChange={(e) => setAddrFields((f) => ({ ...f, city: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>UF</label>
                    <input type="text" value={addrFields.state} onChange={(e) => setAddrFields((f) => ({ ...f, state: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="SP" maxLength={2} style={{ ...inputStyle, fontFamily: "var(--font-mono)", textTransform: "uppercase" }} />
                  </div>
                </div>

                {addrError && <p style={{ margin: 0, fontSize: 12, color: "var(--destructive)" }}>{addrError}</p>}

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveAddress} disabled={addrPending} className="cpv-btn cpv-btn--primary cpv-btn--sm">
                    {addrPending ? "Salvando…" : "Salvar endereço"}
                  </button>
                  <button onClick={() => setAddrEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted-foreground)", padding: "0 8px", height: 36 }}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  {addressSummary ? (
                    <p style={{ margin: 0, fontSize: 14, color: "var(--foreground)", lineHeight: 1.6 }}>
                      {[
                        addrFields.street && `${addrFields.street}${addrFields.number ? `, ${addrFields.number}` : ""}`,
                        addrFields.complement,
                        addrFields.district,
                      ].filter(Boolean).join(", ")}
                      {(addrFields.city || addrFields.state) && (
                        <>
                          <br />
                          {[addrFields.city, addrFields.state].filter(Boolean).join(" – ")}
                          {zipCode && ` · CEP ${zipCode}`}
                        </>
                      )}
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>Endereço não informado.</p>
                  )}
                  {addrSuccess && <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600, display: "block", marginTop: 4 }}>✓ Salvo</span>}
                </div>
                <button onClick={() => setAddrEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, padding: "2px 6px", borderRadius: "var(--radius-sm)", flexShrink: 0 }}>
                  <PencilIcon /> Editar
                </button>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
