import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { renderToStream } from "@react-pdf/renderer";
import { withAuth } from "@/server/auth/with-auth";
import { tenantDb } from "@/server/db/tenant";
import { findCompanyById } from "@/server/models/company";
import { TrainingReport } from "@/lib/pdf/training-report";
import type { ReportData } from "@/lib/pdf/training-report";
import React from "react";

const schema = z.object({
  ids: z.array(z.string()).min(1).max(500),
  format: z.enum(["pdf", "csv"]),
});

export function POST(req: NextRequest) {
  return withAuth({ roles: ["ADMIN"] }, async (innerReq, { user }) => {
    const body = await innerReq.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { ids, format } = parsed.data;
    const db = tenantDb(user.companyId as string);
    const company = await findCompanyById(user.companyId as string);
    const companyName = company?.name ?? "Empresa";

    const trainings = await db.training.findMany({
      where: { id: { in: ids }, companyId: user.companyId as string },
      include: {
        trainingType: { select: { name: true } },
        instructor: { select: { name: true } },
      },
      orderBy: { startsAt: "desc" },
    });

    const rows = trainings.map((t) => ({
      traineeName: t.traineeName,
      traineeCpf: t.traineeCpf
        ? t.traineeCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        : "",
      clientCompanyName: t.clientCompanyName,
      trainingTypeName: t.trainingType.name,
      instructorName: t.instructor.name,
      startsAt: t.startsAt.toISOString(),
      endsAt: t.endsAt.toISOString(),
      hours: (t.endsAt.getTime() - t.startsAt.getTime()) / 3_600_000,
      status: t.status,
      verificationCode: t.verificationCode,
    }));

    if (format === "csv") {
      const header = [
        "Treinando", "CPF", "Empresa cliente", "Tipo de treinamento",
        "Instrutor", "Data início", "Data fim", "Horas", "Status", "Código",
      ].join(";");

      const lines = rows.map((r) =>
        [
          `"${r.traineeName}"`,
          `"${r.traineeCpf}"`,
          `"${r.clientCompanyName}"`,
          `"${r.trainingTypeName}"`,
          `"${r.instructorName}"`,
          new Date(r.startsAt).toLocaleDateString("pt-BR"),
          new Date(r.endsAt).toLocaleDateString("pt-BR"),
          r.hours.toFixed(1).replace(".", ","),
          r.status === "ISSUED" ? "Emitido" : "Cancelado",
          r.verificationCode,
        ].join(";"),
      );

      const csv = "\uFEFF" + [header, ...lines].join("\r\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="relatorio-treinamentos.csv"`,
        },
      });
    }

    // PDF
    const reportData: ReportData = {
      companyName,
      generatedAt: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      rows,
    };

    let stream;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stream = await renderToStream(React.createElement(TrainingReport, { data: reportData }) as any);
    } catch (err) {
      console.error("[PDF Export] renderToStream error:", err);
      return NextResponse.json({ error: "Falha ao gerar relatório PDF." }, { status: 500 });
    }

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-treinamentos.pdf"`,
      },
    });
  })(req);
}
