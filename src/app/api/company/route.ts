import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { companyCreateSchema } from "@/server/validators/company";
import { createCompanyAndPromoteAdmin, CompanyError } from "@/server/services/company";

export const POST = withAuth({}, async (req: NextRequest, { user }) => {
  if (user.companyId) {
    return NextResponse.json(
      { error: "Usuário já pertence a uma empresa." },
      { status: 409 },
    );
  }

  const body = await req.json();
  const parsed = companyCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const company = await createCompanyAndPromoteAdmin(user.id, parsed.data);
    return NextResponse.json({ company }, { status: 201 });
  } catch (err) {
    if (err instanceof CompanyError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
});
