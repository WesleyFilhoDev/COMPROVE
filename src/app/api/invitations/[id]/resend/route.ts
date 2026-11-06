import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { resendInvitation, InvitationError } from "@/server/services/invitation";

export function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(
    { roles: ["ADMIN"] },
    async (_req, { db }) => {
      const { id } = await params;

      try {
        const { waLink } = await resendInvitation(db!, id);
        return NextResponse.json({ waLink });
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
