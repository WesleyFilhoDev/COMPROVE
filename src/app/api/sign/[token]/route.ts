import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";

// GET /api/sign/[token] — info pública para a página de assinatura
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const signature = await db.signature.findUnique({
    where: { signToken: token },
    include: {
      training: {
        select: {
          traineeName: true,
          trainingTypeNameSnapshot: true,
          instructorNameSnapshot: true,
          companyNameSnapshot: true,
          clientCompanyName: true,
          startsAt: true,
          endsAt: true,
          status: true,
          verificationCode: true,
        },
      },
    },
  });

  if (!signature) {
    return NextResponse.json({ error: "Link de assinatura inválido ou expirado." }, { status: 404 });
  }

  if (signature.status === "SIGNED") {
    return NextResponse.json({ error: "Este treinamento já foi assinado.", alreadySigned: true }, { status: 409 });
  }

  if (signature.training.status === "CANCELED") {
    return NextResponse.json({ error: "Este treinamento foi cancelado." }, { status: 410 });
  }

  return NextResponse.json({
    signature: {
      id: signature.id,
      signerName: signature.signerName,
      signerRole: signature.signerRole,
      status: signature.status,
    },
    training: {
      traineeName: signature.training.traineeName,
      trainingType: signature.training.trainingTypeNameSnapshot,
      instructor: signature.training.instructorNameSnapshot,
      company: signature.training.companyNameSnapshot,
      clientCompany: signature.training.clientCompanyName,
      startsAt: signature.training.startsAt.toISOString(),
      endsAt: signature.training.endsAt.toISOString(),
      verificationCode: signature.training.verificationCode,
    },
  });
}

// POST /api/sign/[token] — confirmar assinatura
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const signature = await db.signature.findUnique({
    where: { signToken: token },
    include: {
      training: {
        select: {
          id: true,
          status: true,
          traineeName: true,
          traineePhone: true,
          trainingTypeNameSnapshot: true,
          verificationCode: true,
        },
      },
    },
  });

  if (!signature) {
    return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  }
  if (signature.status === "SIGNED") {
    return NextResponse.json({ error: "Já assinado." }, { status: 409 });
  }
  if (signature.training.status === "CANCELED") {
    return NextResponse.json({ error: "Treinamento cancelado." }, { status: 410 });
  }

  let signatureImage: string | undefined;
  try {
    const body = (await req.json()) as { signatureImage?: string };
    if (body.signatureImage && body.signatureImage.startsWith("data:image/png;base64,")) {
      signatureImage = body.signatureImage;
    }
  } catch {
    // body is optional
  }

  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  await db.signature.update({
    where: { id: signature.id },
    data: {
      status: "SIGNED",
      method: "DIGITAL",
      signedAt: new Date(),
      signatureImage: signatureImage ?? null,
      evidence: { ip, userAgent, signedAt: new Date().toISOString() },
    },
  });

  // When instructor signs, return trainee info so the UI can show WhatsApp links
  if (signature.signerRole === "INSTRUCTOR") {
    const traineeSig = await db.signature.findFirst({
      where: { trainingId: signature.training.id, signerRole: "TRAINEE" },
      select: { signToken: true, status: true },
    });

    return NextResponse.json({
      ok: true,
      signerRole: "INSTRUCTOR",
      trainee: {
        name: signature.training.traineeName,
        phone: signature.training.traineePhone ?? null,
        signToken: traineeSig?.signToken ?? null,
        alreadySigned: traineeSig?.status === "SIGNED",
        trainingType: signature.training.trainingTypeNameSnapshot,
        verificationCode: signature.training.verificationCode,
      },
    });
  }

  return NextResponse.json({ ok: true, signerRole: signature.signerRole });
}
