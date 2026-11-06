import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { invitationCreateSchema } from "@/server/validators/invitation";
import {
  createInvitationForCollaborator,
  InvitationError,
  listCompanyInvitations,
} from "@/server/services/invitation";

export const GET = withAuth({ roles: ["ADMIN"] }, async (_req, { user, db }) => {
  const invitations = await listCompanyInvitations(db!);
  return NextResponse.json({ invitations });
});

export const POST = withAuth(
  { roles: ["ADMIN"] },
  async (req: NextRequest, { user, db }) => {
    const body = await req.json();
    const parsed = invitationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    try {
      const { waLink } = await createInvitationForCollaborator(db!, user.id, parsed.data);
      return NextResponse.json({ waLink }, { status: 201 });
    } catch (err) {
      if (err instanceof InvitationError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }
  },
);
