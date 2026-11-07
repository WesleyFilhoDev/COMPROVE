import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db/client";
import { toE164 } from "@/lib/format";
import type { UserRole } from "@/generated/prisma/client";

const schema = z.object({
  companyName: z.string().min(2).max(200),
  segment: z.string().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as typeof session.user & {
    role: UserRole | null;
    companyId: string | null;
  };

  if (user.companyId) {
    return NextResponse.json({ error: "Usuário já pertence a uma empresa." }, { status: 409 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { companyName, segment, phone, jobTitle } = parsed.data;

  await db.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: companyName, segment: segment || null },
    });
    await tx.user.update({
      where: { id: user.id },
      data: {
        companyId: company.id,
        role: "ADMIN",
        ...(phone ? { phone: toE164(phone) } : {}),
        ...(jobTitle ? { jobTitle } : {}),
      },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
