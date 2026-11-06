import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db/client";
import { auth } from "@/server/auth/auth";
import { toE164 } from "@/lib/format";

const schema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  companyName: z.string().min(2).max(200),
  segment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email, password, phone, jobTitle, companyName, segment } = parsed.data;

  // 1. Cria o usuário via Better Auth
  const signUpRes = await auth.api.signUpEmail({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: { name, email, password } as any,
  });

  if (!signUpRes?.user) {
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 400 });
  }

  const userId = signUpRes.user.id;

  // 2. Cria empresa e vincula o usuário como ADMIN em uma transação
  await db.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: companyName, segment: segment || null },
    });
    await tx.user.update({
      where: { id: userId },
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
