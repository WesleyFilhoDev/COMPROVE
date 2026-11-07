import crypto from "crypto";
import { db } from "@/server/db/client";
import type { TenantDb } from "@/server/db/tenant";
import {
  createInvitation,
  listInvitations,
  revokeInvitation,
  updateInvitationToken,
} from "@/server/models/invitation";
import type { InvitationCreate } from "@/server/validators/invitation";

export class InvitationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID"
      | "ALREADY_ACCEPTED"
      | "REVOKED"
      | "EXPIRED"
      | "USER_HAS_COMPANY"
      | "NOT_FOUND",
  ) {
    super(message);
  }
}

function generateToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

function expiresInDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function buildWaLink(phone: string, name: string, token: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const encodedText = encodeURIComponent(
    `Olá ${name}, você foi convidado para o Comproved. Acesse o link para aceitar o convite: ${baseUrl}/convite/${token}`,
  );
  // phone is stored as digits (without +55), e.g. "11999999999"
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/55${digits}?text=${encodedText}`;
}

export async function listCompanyInvitations(tenantDb: TenantDb) {
  return listInvitations(tenantDb);
}

export async function createInvitationForCollaborator(
  tenantDb: TenantDb,
  invitedById: string,
  data: InvitationCreate,
): Promise<{ waLink: string }> {
  const { token, tokenHash } = generateToken();
  const expiresAt = expiresInDays(7);

  await createInvitation(tenantDb, {
    invitedById,
    name: data.name,
    phone: data.phone,
    jobTitle: data.jobTitle,
    tokenHash,
    expiresAt,
  });

  const waLink = buildWaLink(data.phone, data.name, token);
  return { waLink };
}

export async function resendInvitation(
  tenantDb: TenantDb,
  id: string,
): Promise<{ waLink: string }> {
  // Fetch the invitation using tenantDb to ensure it belongs to this company
  const invitation = await tenantDb.invitation.findUnique({ where: { id } });
  if (!invitation) throw new InvitationError("Convite não encontrado.", "NOT_FOUND");

  const { token, tokenHash } = generateToken();
  const expiresAt = expiresInDays(7);

  await updateInvitationToken(tenantDb, id, tokenHash, expiresAt);

  const waLink = buildWaLink(invitation.phone, invitation.name, token);
  return { waLink };
}

export async function revokeCompanyInvitation(
  tenantDb: TenantDb,
  id: string,
): Promise<void> {
  const invitation = await tenantDb.invitation.findUnique({ where: { id } });
  if (!invitation) throw new InvitationError("Convite não encontrado.", "NOT_FOUND");

  await revokeInvitation(tenantDb, id);
}

export async function acceptInvitation(
  userId: string,
  token: string,
): Promise<void> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await db.$transaction(async (tx) => {
    // Check user doesn't already have a company
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new InvitationError("Usuário não encontrado.", "INVALID");
    if (user.companyId) throw new InvitationError("Usuário já pertence a uma empresa.", "USER_HAS_COMPANY");

    // Atomically accept — WHERE conditions prevent double-accept
    const updated = await tx.invitation.updateMany({
      where: {
        tokenHash,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { acceptedAt: new Date(), acceptedById: userId },
    });

    if (updated.count === 0) {
      throw new InvitationError(
        "Convite inválido, expirado ou já utilizado.",
        "INVALID",
      );
    }

    // Fetch the invitation to get companyId, phone, jobTitle (inside tx to avoid stale read)
    const invitation = await tx.invitation.findUnique({
      where: { tokenHash },
      select: { companyId: true, phone: true, jobTitle: true },
    });
    if (!invitation) throw new InvitationError("Convite não encontrado.", "NOT_FOUND");

    // Bind user to company
    await tx.user.update({
      where: { id: userId },
      data: {
        companyId: invitation.companyId,
        role: "COLLABORATOR",
        phone: invitation.phone,
        jobTitle: invitation.jobTitle,
      },
    });
  });
}
