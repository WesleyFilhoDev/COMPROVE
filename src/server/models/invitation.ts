import { db } from "@/server/db/client";
import type { TenantDb } from "@/server/db/tenant";

/** Find an invitation by tokenHash using raw db (no tenant scope needed). */
export async function findInvitationByTokenHash(tokenHash: string) {
  return db.invitation.findUnique({
    where: { tokenHash },
    include: {
      company: { select: { id: true, name: true } },
      invitedBy: { select: { id: true, name: true } },
      acceptedBy: { select: { id: true, name: true } },
    },
  });
}

/** List all invitations for a company via tenantDb (already scoped). */
export async function listInvitations(tenantDb: TenantDb) {
  return tenantDb.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invitedBy: { select: { id: true, name: true } },
      acceptedBy: { select: { id: true, name: true } },
    },
  });
}

/** Create a new invitation record. */
export async function createInvitation(
  tenantDb: TenantDb,
  data: {
    invitedById: string;
    name: string;
    phone: string;
    jobTitle: string;
    tokenHash: string;
    expiresAt: Date;
  },
) {
  // tenantDb automatically injects companyId via the extension query hook
  return tenantDb.invitation.create({ data: data as typeof data & { companyId: string } });
}

/** Update tokenHash and expiresAt for resend. */
export async function updateInvitationToken(
  tenantDb: TenantDb,
  id: string,
  tokenHash: string,
  expiresAt: Date,
) {
  return tenantDb.invitation.update({
    where: { id },
    data: { tokenHash, expiresAt, revokedAt: null },
  });
}

/** Set revokedAt to revoke an invitation. */
export async function revokeInvitation(tenantDb: TenantDb, id: string) {
  return tenantDb.invitation.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}
