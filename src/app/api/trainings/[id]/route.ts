import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { trainingUpdateSchema } from "@/server/validators/training";
import { updateTraining, TrainingError } from "@/server/services/training";
import { findTrainingById } from "@/server/models/training";

export function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth({ roles: ["ADMIN", "COLLABORATOR"] }, async (innerReq, { user, db }) => {
    const extUser = user as typeof user & { companyId: string; role: string };
    const { id } = await params;

    // COLLABORATOR só pode editar treinamentos que registrou
    if (extUser.role === "COLLABORATOR") {
      const existing = await findTrainingById(db!, id);
      if (!existing) {
        return NextResponse.json({ error: "Treinamento não encontrado." }, { status: 404 });
      }
      if (existing.instructorId !== extUser.id) {
        return NextResponse.json({ error: "Você só pode editar treinamentos que você mesmo registrou." }, { status: 403 });
      }
    }

    const body = await innerReq.json();
    const parsed = trainingUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    try {
      const training = await updateTraining(extUser, db!, id, parsed.data);
      return NextResponse.json({ training });
    } catch (err) {
      if (err instanceof TrainingError) {
        const status = err.code === "NOT_FOUND" ? 404 : err.code === "INVALID_DATES" ? 422 : 400;
        return NextResponse.json({ error: err.message }, { status });
      }
      throw err;
    }
  })(req);
}
