import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { withAuth } from "@/server/auth/with-auth";
import { trainingCreateSchema } from "@/server/validators/training";
import { listTrainings } from "@/server/models/training";
import { emitTraining, TrainingError } from "@/server/services/training";

export const GET = withAuth(
  { roles: ["ADMIN", "COLLABORATOR"] },
  async (req: NextRequest, { user, db: tenantDb }) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as "ISSUED" | "CANCELED" | null;
    const instructorId = searchParams.get("instructorId") ?? undefined;
    const trainingTypeId = searchParams.get("trainingTypeId") ?? undefined;

    const trainings = await listTrainings(tenantDb!, {
      ...(status ? { status } : {}),
      instructorId,
      trainingTypeId,
    });

    return NextResponse.json({ trainings });
  },
);

export const POST = withAuth(
  { roles: ["ADMIN", "COLLABORATOR"] },
  async (req: NextRequest, { user, db: tenantDb }) => {
    const body = await req.json();
    const parsed = trainingCreateSchema.safeParse(body);

    if (!parsed.success) {
      console.error("[trainings POST] validation failed:", JSON.stringify(parsed.error.flatten()));
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const companyId = (user as typeof user & { companyId: string | null }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Usuário sem empresa associada." }, { status: 403 });
    }

    try {
      const training = await emitTraining(user, companyId, tenantDb!, db, parsed.data);
      return NextResponse.json({ training }, { status: 201 });
    } catch (err) {
      if (err instanceof TrainingError) {
        const statusCode =
          err.code === "NOT_FOUND" ? 404 : err.code === "INVALID_DATES" ? 422 : 409;
        return NextResponse.json({ error: err.message }, { status: statusCode });
      }
      throw err;
    }
  },
);
