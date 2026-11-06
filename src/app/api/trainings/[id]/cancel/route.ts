import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/auth/with-auth";
import { trainingCancelSchema } from "@/server/validators/training";
import { cancelTraining, TrainingError } from "@/server/services/training";

const handler = withAuth(
  { roles: ["ADMIN"] },
  async (req: NextRequest, { user, db: tenantDb }) => {
    // Extract id from URL: /api/trainings/[id]/cancel
    const segments = req.nextUrl.pathname.split("/");
    const id = segments[segments.length - 2]; // …/[id]/cancel

    const body = await req.json();
    const parsed = trainingCancelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const companyId = (user as typeof user & { companyId: string | null }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Usuário sem empresa associada." }, { status: 403 });
    }

    try {
      const training = await cancelTraining(user, companyId, tenantDb!, id, parsed.data.reason);
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
);

export { handler as POST };
