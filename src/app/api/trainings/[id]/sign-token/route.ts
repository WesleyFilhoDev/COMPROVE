import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { tenantDb } from "@/server/db/tenant";

export function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth({ roles: ["ADMIN", "COLLABORATOR"] }, async (_req, { user }) => {
    const { id } = await params;
    const db = tenantDb(user.companyId as string);

    const signature = await db.signature.findFirst({
      where: { trainingId: id, signerRole: "TRAINEE" },
      select: { signToken: true, status: true },
    });

    if (!signature) {
      return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      signToken: signature.signToken,
      status: signature.status,
    });
  })(req);
}
