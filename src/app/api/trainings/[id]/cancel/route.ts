import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { trainingCancelSchema } from "@/server/validators/training";
import { cancelTraining, TrainingError } from "@/server/services/training";
import { findTrainingById } from "@/server/models/training";

export function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(
    { roles: ["ADMIN", "COLLABORATOR"] },
    async (req: NextRequest, { user, db: tenantDb }) => {
      const extUser = user as typeof user & { companyId: string | null; role: string };

      if (!extUser.companyId) {
        return NextResponse.json({ error: "Usuário sem empresa associada." }, { status: 403 });
      }

      const { id } = await params;

      // COLLABORATOR só pode cancelar treinamentos que registrou
      if (extUser.role === "COLLABORATOR") {
        const existing = await findTrainingById(tenantDb!, id);
        if (!existing) {
          return NextResponse.json({ error: "Treinamento não encontrado." }, { status: 404 });
        }
        if (existing.instructorId !== extUser.id) {
          return NextResponse.json({ error: "Você só pode cancelar treinamentos que você mesmo registrou." }, { status: 403 });
        }
      }

      const body = await req.json();
      const parsed = trainingCancelSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
      }

      try {
        const training = await cancelTraining(user, tenantDb!, id, parsed.data.reason);
        return NextResponse.json({ training });
      } catch (err) {
        if (err instanceof TrainingError) {
          const statusCode =
            err.code === "NOT_FOUND" ? 404 : err.code === "ALREADY_CANCELED" ? 409 : 422;
          return NextResponse.json({ error: err.message }, { status: statusCode });
        }
        throw err;
      }
    },
  )(req);
}
