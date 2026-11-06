"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskPhone, toE164 } from "@/lib/format";

type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

type InvitationRow = {
  id: string;
  name: string;
  jobTitle: string;
  phone: string;
  status: InvitationStatus;
  invitedByName: string;
  createdAt: string;
};

type CollaboratorRow = {
  id: string;
  name: string;
  jobTitle: string | null;
  email: string;
};

function getInvitationStatus(inv: {
  acceptedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
}): InvitationStatus {
  if (inv.acceptedAt) return "accepted";
  if (inv.revokedAt) return "revoked";
  if (new Date(inv.expiresAt) < new Date()) return "expired";
  return "pending";
}

function StatusBadge({ status }: { status: InvitationStatus | "collaborator" }) {
  const styles: Record<string, { bg: string; color: string; border: string; label: string }> = {
    collaborator: {
      bg: "var(--success-soft)",
      color: "var(--success)",
      border: "var(--success-border)",
      label: "Colaborador",
    },
    pending: {
      bg: "var(--azul-gelo)",
      color: "var(--azul-eletrico)",
      border: "var(--azul-eletrico)",
      label: "Pendente",
    },
    accepted: {
      bg: "var(--success-soft)",
      color: "var(--success)",
      border: "var(--success-border)",
      label: "Aceito",
    },
    revoked: {
      bg: "var(--destructive-soft)",
      color: "var(--destructive)",
      border: "var(--destructive-border)",
      label: "Revogado",
    },
    expired: {
      bg: "var(--nevoa)",
      color: "var(--muted-foreground)",
      border: "var(--border)",
      label: "Expirado",
    },
  };

  const s = styles[status] ?? styles.pending;

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}

type RawInvitation = {
  id: string;
  name: string;
  jobTitle: string;
  phone: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string };
};

type Props = {
  collaborators: CollaboratorRow[];
  invitations: RawInvitation[];
};

export function ColaboradoresClient({ collaborators, invitations: initialInvitations }: Props) {
  const [invitations, setInvitations] = useState<RawInvitation[]>(initialInvitations);
  const [showForm, setShowForm] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const [fields, setFields] = useState({ name: "", phone: "", jobTitle: "" });

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setPending(true);

    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.name,
        phone: toE164(fields.phone).replace(/^\+55/, ""), // digits only
        jobTitle: fields.jobTitle,
      }),
    });

    setPending(false);

    if (!res.ok) {
      const json = (await res.json()) as { error: string | { formErrors?: string[] } };
      const msg =
        typeof json.error === "string"
          ? json.error
          : (json.error?.formErrors?.[0] ?? "Erro ao criar convite.");
      setFormError(msg);
      return;
    }

    const json = (await res.json()) as { waLink: string };
    setWaLink(json.waLink);
    setFields({ name: "", phone: "", jobTitle: "" });
    setShowForm(false);

    // Refresh invitation list
    const listRes = await fetch("/api/invitations");
    if (listRes.ok) {
      const data = (await listRes.json()) as { invitations: RawInvitation[] };
      setInvitations(data.invitations);
    }
  }

  async function handleResend(id: string) {
    setActionPending(id + ":resend");
    const res = await fetch(`/api/invitations/${id}/resend`, { method: "POST" });
    setActionPending(null);

    if (!res.ok) return;

    const json = (await res.json()) as { waLink: string };
    setWaLink(json.waLink);

    // Refresh
    const listRes = await fetch("/api/invitations");
    if (listRes.ok) {
      const data = (await listRes.json()) as { invitations: RawInvitation[] };
      setInvitations(data.invitations);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Tem certeza que deseja revogar este convite?")) return;
    setActionPending(id + ":revoke");
    await fetch(`/api/invitations/${id}/revoke`, { method: "POST" });
    setActionPending(null);

    // Refresh
    const listRes = await fetch("/api/invitations");
    if (listRes.ok) {
      const data = (await listRes.json()) as { invitations: RawInvitation[] };
      setInvitations(data.invitations);
    }
  }

  const invitationRows: InvitationRow[] = invitations.map((inv) => ({
    id: inv.id,
    name: inv.name,
    jobTitle: inv.jobTitle,
    phone: inv.phone,
    status: getInvitationStatus(inv),
    invitedByName: inv.invitedBy.name,
    createdAt: inv.createdAt,
  }));

  return (
    <div className="space-y-8">
      {/* wa.me link alert */}
      {waLink && (
        <div
          className="rounded-xl border p-4 flex items-start gap-3"
          style={{
            background: "var(--success-soft)",
            borderColor: "var(--success-border)",
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>
              Convite criado! Envie o link abaixo pelo WhatsApp:
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all mt-1 block"
              style={{ color: "var(--success)" }}
            >
              {waLink}
            </a>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Este link é exibido apenas uma vez.
            </p>
          </div>
          <button
            onClick={() => setWaLink(null)}
            className="text-sm font-medium flex-shrink-0"
            style={{ color: "var(--success)" }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Collaborators section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
          >
            Colaboradores
          </h2>
          <Button
            onClick={() => { setShowForm((v) => !v); setFormError(null); }}
            variant="default"
          >
            Novo convite
          </Button>
        </div>

        {/* New invitation form */}
        {showForm && (
          <div
            className="mb-6 rounded-xl border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3
              className="text-base font-semibold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Novo convite
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-name">Nome</Label>
                  <Input
                    id="inv-name"
                    required
                    value={fields.name}
                    onChange={set("name")}
                    placeholder="Maria Silva"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-phone">Telefone (WhatsApp)</Label>
                  <Input
                    id="inv-phone"
                    required
                    value={fields.phone}
                    onChange={(e) =>
                      setFields((p) => ({ ...p, phone: maskPhone(e.target.value) }))
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-job">Cargo</Label>
                  <Input
                    id="inv-job"
                    required
                    value={fields.jobTitle}
                    onChange={set("jobTitle")}
                    placeholder="Instrutor"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm" style={{ color: "var(--destructive)" }}>
                  {formError}
                </p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                  {pending ? "Criando…" : "Criar convite"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Active collaborators table */}
        {collaborators.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhum colaborador ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--nevoa)" }}>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>Nome</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>E-mail</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>Cargo</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {collaborators.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-4 font-medium" style={{ color: "var(--foreground)" }}>{c.name}</td>
                    <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>{c.email}</td>
                    <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>{c.jobTitle ?? "—"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status="collaborator" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Invitations section */}
      <section>
        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
        >
          Convites enviados
        </h2>

        {invitationRows.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhum convite enviado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--nevoa)" }}>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>Nome</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>Cargo</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>Status</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>Convidado por</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted-foreground)" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {invitationRows.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-4 font-medium" style={{ color: "var(--foreground)" }}>{inv.name}</td>
                    <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>{inv.jobTitle}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>{inv.invitedByName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {(inv.status === "pending" || inv.status === "expired") && (
                          <>
                            <button
                              onClick={() => handleResend(inv.id)}
                              disabled={actionPending === inv.id + ":resend"}
                              className="text-xs font-medium"
                              style={{ color: "var(--azul-eletrico)" }}
                            >
                              {actionPending === inv.id + ":resend" ? "Reenviando…" : "Reenviar"}
                            </button>
                            <button
                              onClick={() => handleRevoke(inv.id)}
                              disabled={actionPending === inv.id + ":revoke"}
                              className="text-xs font-medium"
                              style={{ color: "var(--destructive)" }}
                            >
                              {actionPending === inv.id + ":revoke" ? "Revogando…" : "Revogar"}
                            </button>
                          </>
                        )}
                        {inv.status === "accepted" && (
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
                        )}
                        {inv.status === "revoked" && (
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Revogado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
