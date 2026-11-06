import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { tenantDb, type TenantDb } from "@/server/db/tenant";
import type { UserRole } from "@/generated/prisma/client";

type SessionUser = typeof auth.$Infer.Session.user;

export type AuthContext = {
  user: SessionUser;
  db: TenantDb | null;
};

type Handler = (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>;

export function withAuth(options: { roles?: UserRole[] }, handler: Handler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const user = session.user as SessionUser & {
      role: UserRole | null;
      companyId: string | null;
      deactivatedAt: Date | null;
    };

    if (user.deactivatedAt) {
      return NextResponse.json({ error: "Conta desativada." }, { status: 403 });
    }

    if (options.roles && options.roles.length > 0) {
      if (!user.role || !options.roles.includes(user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    }

    const contextDb = user.companyId ? tenantDb(user.companyId) : null;

    return handler(req, { user, db: contextDb });
  };
}
