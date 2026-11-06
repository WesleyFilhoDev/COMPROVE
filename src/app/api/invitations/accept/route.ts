import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { invitationAcceptSchema } from "@/server/validators/invitation";
import { acceptInvitation, InvitationError } from "@/server/services/invitation";

export const POST = withAuth({}, async (req: NextRequest, { user }) => {
  if (user.companyId) {
    return NextResponse.json(
      { error: "Usuário já pertence a uma empresa." },
      { status: 409 },
    );
  }

  const body = await req.json();
  const parsed = invitationAcceptSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    await acceptInvitation(user.id, parsed.data.token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof InvitationError) {
      if (err.code === "USER_HAS_COMPANY") {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
});
