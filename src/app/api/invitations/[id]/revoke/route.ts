import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { revokeCompanyInvitation, InvitationError } from "@/server/services/invitation";

export function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(
    { roles: ["ADMIN"] },
    async (_req, { db }) => {
      const { id } = await params;

      try {
        await revokeCompanyInvitation(db!, id);
        return NextResponse.json({ ok: true });
      } catch (err) {
        if (err instanceof InvitationError) {
          const status = err.code === "NOT_FOUND" ? 404 : 409;
          return NextResponse.json({ error: err.message }, { status });
        }
        throw err;
      }
    },
  )(req);
}
