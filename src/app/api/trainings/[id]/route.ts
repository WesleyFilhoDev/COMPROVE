import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { trainingUpdateSchema } from "@/server/validators/training";
import { updateTraining, TrainingError } from "@/server/services/training";

export function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth({ roles: ["ADMIN"] }, async (innerReq, { user, db }) => {
    const { id } = await params;
    const body = await innerReq.json();
    const parsed = trainingUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    try {
      const training = await updateTraining(
        user as typeof user & { companyId: string },
        db!,
        id,
        parsed.data,
      );
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
