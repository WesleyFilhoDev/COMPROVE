import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { withAuth } from "@/server/auth/with-auth";
import { tenantDb } from "@/server/db/tenant";
import { TrainingCertificate } from "@/lib/pdf/training-certificate";
import type { CertificateData } from "@/lib/pdf/training-certificate";
import React from "react";

export function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth({}, async (_req, { user }) => {
    if (!user.companyId) {
      return NextResponse.json({ error: "Sem empresa vinculada." }, { status: 403 });
    }

    const { id } = await params;
    const db = tenantDb(user.companyId);

    const training = await db.training.findFirst({
      where: { id },
      include: {
        signatures: {
          orderBy: [{ signerRole: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!training) {
      return NextResponse.json({ error: "Treinamento não encontrado." }, { status: 404 });
    }

    if (!training.companyCnpjSnapshot) {
      return NextResponse.json({ error: "Dados da empresa incompletos." }, { status: 422 });
    }

    const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const verifyUrl = `${appUrl}/verificar?codigo=${training.verificationCode}`;

    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#0f1a2e", light: "#ffffff" },
    });

    const data: CertificateData = {
      verificationCode: training.verificationCode,
      trainingTypeNameSnapshot: training.trainingTypeNameSnapshot,
      declarationTextSnapshot: training.declarationTextSnapshot ?? null,
      companyNameSnapshot: training.companyNameSnapshot,
      companyCnpjSnapshot: training.companyCnpjSnapshot,
      instructorNameSnapshot: training.instructorNameSnapshot,
      instructorJobTitleSnapshot: training.instructorJobTitleSnapshot,
      traineeName: training.traineeName,
      traineeCpf: training.traineeCpf,
      clientCompanyName: training.clientCompanyName,
      contentMinistrado: training.contentMinistrado ?? null,
      startsAt: training.startsAt,
      endsAt: training.endsAt,
      signatures: training.signatures.map((sig) => ({
        signerName: sig.signerName,
        signerRole: sig.signerRole,
        status: sig.status,
        signedAt: sig.signedAt,
      })),
      qrCodeDataUrl,
      appUrl,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(React.createElement(TrainingCertificate, { data }) as any);
    const filename = `CPV-${training.verificationCode}.pdf`;

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  })(req);
}
