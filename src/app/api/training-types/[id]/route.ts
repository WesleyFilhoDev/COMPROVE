import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { trainingTypeUpdateSchema } from "@/server/validators/training-type";
import {
  updateTrainingType,
  archiveTrainingType,
  TrainingTypeError,
} from "@/server/services/training-type";

export function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(
    { roles: ["ADMIN"] },
    async (innerReq, { user, db }) => {
      const { id } = await params;
      const body = await innerReq.json();
      const parsed = trainingTypeUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
      }

      try {
        const type = await updateTrainingType(
          user.id,
          user.companyId as string,
          db!,
          id,
          parsed.data,
        );
        return NextResponse.json({ type });
      } catch (err) {
        if (err instanceof TrainingTypeError) {
          const status = err.code === "NOT_FOUND" ? 404 : 409;
          return NextResponse.json({ error: err.message }, { status });
        }
        throw err;
      }
    },
  )(req);
}

export function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(
    { roles: ["ADMIN"] },
    async (_innerReq, { user, db }) => {
      const { id } = await params;

      try {
        await archiveTrainingType(user.id, user.companyId as string, db!, id);
        return NextResponse.json({ ok: true });
      } catch (err) {
        if (err instanceof TrainingTypeError) {
          const status = err.code === "NOT_FOUND" ? 404 : 400;
          return NextResponse.json({ error: err.message }, { status });
        }
        throw err;
      }
    },
  )(req);
}
