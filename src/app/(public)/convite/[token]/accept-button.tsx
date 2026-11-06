"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setError(null);
    setPending(true);

    const res = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    setPending(false);

    if (!res.ok) {
      const json = (await res.json()) as { error: string };
      setError(typeof json.error === "string" ? json.error : "Erro ao aceitar convite.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="space-y-3">
      {error && (
        <p
          className="text-sm rounded-lg px-3 py-2 border"
          style={{
            color: "var(--destructive)",
            background: "var(--destructive-soft)",
            borderColor: "var(--destructive-border)",
          }}
        >
          {error}
        </p>
      )}
      <Button
        onClick={handleAccept}
        disabled={pending}
        className="w-full"
        style={{ justifyContent: "center" }}
      >
        {pending ? "Aceitando…" : "Aceitar convite"}
      </Button>
    </div>
  );
}
