"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { maskCnpj, maskZipCode } from "@/lib/format";

type Field = {
  name: string;
  cnpj: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

const INITIAL: Field = {
  name: "",
  cnpj: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

export default function EmpresaPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Field>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(key: keyof Field) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const res = await fetch("/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        complement: fields.complement || undefined,
      }),
    });

    setPending(false);

    if (!res.ok) {
      const json = (await res.json()) as { error: string };
      setError(typeof json.error === "string" ? json.error : "Erro ao cadastrar empresa.");
      return;
    }

    router.push("/dashboard");
  }

  async function fetchAddress() {
    const cep = fields.zipCode.replace(/\D/g, "");
    if (cep.length !== 8) return;

    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return;

    const data = (await res.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };

    if (data.erro) return;

    setFields((prev) => ({
      ...prev,
      street: data.logradouro ?? prev.street,
      district: data.bairro ?? prev.district,
      city: data.localidade ?? prev.city,
      state: data.uf ?? prev.state,
    }));
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Cadastrar empresa</CardTitle>
          <CardDescription>
            Preencha os dados da sua empresa para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Razão social</Label>
              <Input
                id="name"
                required
                value={fields.name}
                onChange={set("name")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                required
                placeholder="00.000.000/0000-00"
                value={fields.cnpj}
                onChange={(e) =>
                  setFields((p) => ({ ...p, cnpj: maskCnpj(e.target.value) }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  required
                  placeholder="00000-000"
                  value={fields.zipCode}
                  onChange={(e) =>
                    setFields((p) => ({
                      ...p,
                      zipCode: maskZipCode(e.target.value),
                    }))
                  }
                  onBlur={fetchAddress}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  required
                  maxLength={2}
                  placeholder="SP"
                  value={fields.state}
                  onChange={set("state")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="street">Logradouro</Label>
              <Input
                id="street"
                required
                value={fields.street}
                onChange={set("street")}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  required
                  value={fields.number}
                  onChange={set("number")}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={fields.complement}
                  onChange={set("complement")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="district">Bairro</Label>
                <Input
                  id="district"
                  required
                  value={fields.district}
                  onChange={set("district")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  required
                  value={fields.city}
                  onChange={set("city")}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Cadastrando…" : "Cadastrar empresa"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
