import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db/client";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo inválido." }, { status: 422 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WebP." }, { status: 422 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Imagem muito grande. Máximo 2 MB." }, { status: 422 });

  const ext = file.type.split("/")[1];
  const { url } = await put(`avatars/${session.user.id}.${ext}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  await db.user.update({
    where: { id: session.user.id },
    data: { image: url },
  });

  return NextResponse.json({ url });
}
