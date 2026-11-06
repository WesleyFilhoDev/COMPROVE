import { NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { trainingTypeCreateSchema } from "@/server/validators/training-type";
import {
  createTrainingType,
  TrainingTypeError,
} from "@/server/services/training-type";
import { listTrainingTypes } from "@/server/models/training-type";

export const GET = withAuth({ roles: ["ADMIN"] }, async (_req, { db }) => {
  const types = await listTrainingTypes(db!);
  return NextResponse.json({ types });
});

export const POST = withAuth({ roles: ["ADMIN"] }, async (req, { user, db }) => {
  const body = await req.json();
  const parsed = trainingTypeCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const type = await createTrainingType(user.id, user.companyId as string, db!, parsed.data);
    return NextResponse.json({ type }, { status: 201 });
  } catch (err) {
    if (err instanceof TrainingTypeError) {
      const status = err.code === "NAME_TAKEN" ? 409 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }
    throw err;
  }
});
