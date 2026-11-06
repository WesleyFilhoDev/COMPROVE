export async function verifyRecaptcha(token: string | null): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) return true;
  if (!token) return false;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
    }),
  });

  const data = (await res.json()) as { success: boolean; score?: number };
  return data.success === true && (data.score === undefined || data.score >= 0.5);
}
