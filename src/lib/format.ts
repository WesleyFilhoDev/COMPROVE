export function maskCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
}

export function validateCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (s: string, w: number[]) => w.reduce((a, v, i) => a + parseInt(s[i]) * v, 0);
  const r1 = calc(d, [10, 9, 8, 7, 6, 5, 4, 3, 2]) % 11;
  const r2 = calc(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) % 11;
  return (
    parseInt(d[9]) === (r1 < 2 ? 0 : 11 - r1) &&
    parseInt(d[10]) === (r2 < 2 ? 0 : 11 - r2)
  );
}

export function validateCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calc = (d: string, weights: number[]) =>
    weights.reduce((sum, w, i) => sum + parseInt(d[i]) * w, 0);

  const mod = (n: number) => {
    const r = n % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const d1 = mod(calc(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  const d2 = mod(calc(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));

  return parseInt(digits[12]) === d1 && parseInt(digits[13]) === d2;
}

export function maskCnpj(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskZipCode(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
}

export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export function toE164(phone: string, country = "55"): string {
  const d = phone.replace(/\D/g, "");
  return "+" + country + d;
}
