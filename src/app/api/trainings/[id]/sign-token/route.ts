import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { withAuth } from "@/server/auth/with-auth";
import { tenantDb } from "@/server/db/tenant";

export function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth({ roles: ["ADMIN", "COLLABORATOR"] }, async (_req, { user }) => {
    const { id } = await params;
    const db = tenantDb(user.companyId as string);

    // Busca assinatura existente do treinando
    let signature = await db.signature.findFirst({
      where: { trainingId: id, signerRole: "TRAINEE" },
      select: { signToken: true, status: true, signerName: true },
    });

    // Se não existe (treinamento antigo), cria a assinatura com token
    if (!signature) {
      const training = await db.training.findFirst({
        where: { id },
        select: { traineeName: true, companyId: true, status: true },
      });

      if (!training || training.status === "CANCELED") {
        return NextResponse.json({ error: "Treinamento não encontrado." }, { status: 404 });
      }

      const signToken = crypto.randomBytes(32).toString("hex");

      const created = await db.signature.create({
        data: {
          companyId: training.companyId,
          trainingId: id,
          signerRole: "TRAINEE",
          signerName: training.traineeName,
          status: "PENDING",
          signToken,
        },
        select: { signToken: true, status: true },
      });

      signature = { ...created, signerName: training.traineeName };
    }

    // Se token ainda null (registro antigo sem token), gera um agora
    if (!signature.signToken) {
      const signToken = crypto.randomBytes(32).toString("hex");
      await db.signature.update({
        where: { trainingId_signerRole: { trainingId: id, signerRole: "TRAINEE" } },
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
