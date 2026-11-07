import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { withAuth } from "@/server/auth/with-auth";
import { tenantDb } from "@/server/db/tenant";

export function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth({ roles: ["ADMIN", "COLLABORATOR"] }, async (_req, { user }) => {
    if (!user.companyId) {
      return NextResponse.json({ error: "Sem empresa vinculada." }, { status: 403 });
    }
    const { id } = await params;
    const url = new URL(req.url);
    const role = url.searchParams.get("role") === "INSTRUCTOR" ? "INSTRUCTOR" : "TRAINEE";
    const db = tenantDb(user.companyId);

    // Try to find existing signature for this role
    let signature = await db.signature.findFirst({
      where: { trainingId: id, signerRole: role },
      select: { signToken: true, status: true, signerName: true },
    });

    // Backward-compat: create if missing (old trainings pre-token)
    if (!signature) {
      const training = await db.training.findFirst({
        where: { id },
        select: {
          traineeName: true,
          instructorNameSnapshot: true,
          instructorId: true,
          companyId: true,
          status: true,
        },
      });

      if (!training || training.status === "CANCELED") {
        return NextResponse.json({ error: "Treinamento não encontrado." }, { status: 404 });
      }

      const signToken = crypto.randomBytes(32).toString("hex");
      const signerName = role === "INSTRUCTOR"
        ? training.instructorNameSnapshot
        : training.traineeName;

      const created = await db.signature.create({
        data: {
          companyId: training.companyId,
          trainingId: id,
          signerRole: role,
          signerName,
          status: "PENDING",
          signToken,
        },
        select: { signToken: true, status: true },
      });

      signature = { ...created, signerName };
    }

    // Backward-compat: fill missing token on existing record
    if (!signature.signToken) {
      const signToken = crypto.randomBytes(32).toString("hex");
      await db.signature.update({
        where: { trainingId_signerRole: { trainingId: id, signerRole: role } },
        data: { signToken },
      });
      return NextResponse.json({ signToken, status: signature.status });
    }

    return NextResponse.json({
      signToken: signature.signToken,
      status: signature.status,
    });
  })(req);
}
