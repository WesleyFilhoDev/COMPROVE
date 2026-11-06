import crypto from "crypto";

/**
 * Generate an 8-char uppercase alphanumeric verification code.
 * Avoids 0, O, I, 1 to prevent confusion when reading printed codes.
 */
export function generateVerificationCode(): string {
  return crypto
    .randomBytes(6)
    .toString("hex")
    .toUpperCase()
    .replace(/[0O1I]/g, "X")
    .slice(0, 8);
}

export type CanonicalFields = {
  traineeName: string;
  traineeCpf: string;
  clientCompanyName: string;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
  instructorNameSnapshot: string;
  instructorJobTitleSnapshot: string;
  trainingTypeNameSnapshot: string;
  companyNameSnapshot: string;
  companyCnpjSnapshot: string;
  templateVersion: number;
};

/**
 * Compute a SHA-256 hash of the canonical training fields.
 * Keys are sorted to ensure determinism.
 */
export function computeContentHash(fields: CanonicalFields): string {
  const sorted = Object.fromEntries(
    Object.entries(fields).sort(([a], [b]) => a.localeCompare(b)),
  );
  return crypto.createHash("sha256").update(JSON.stringify(sorted)).digest("hex");
}
