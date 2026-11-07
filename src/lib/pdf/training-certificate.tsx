import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

// ── Fontes (arquivos locais em /public/fonts — sem dependência de CDN) ───────
const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Manrope",
  fonts: [
    { src: path.join(fontsDir, "manrope-400.woff2"), fontWeight: 400 },
    { src: path.join(fontsDir, "manrope-600.woff2"), fontWeight: 600 },
    { src: path.join(fontsDir, "manrope-700.woff2"), fontWeight: 700 },
    { src: path.join(fontsDir, "manrope-800.woff2"), fontWeight: 800 },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontsDir, "inter-400.woff2"), fontWeight: 400 },
    { src: path.join(fontsDir, "inter-500.woff2"), fontWeight: 500 },
    { src: path.join(fontsDir, "inter-600.woff2"), fontWeight: 600 },
    { src: path.join(fontsDir, "inter-700.woff2"), fontWeight: 700 },
  ],
});

// ── Cores ────────────────────────────────────────────────────────────────────
const C = {
  marinho:   "#0f1a2e",
  azul:      "#2a5bff",
  azulSinal: "#6b8fff",
  azulGelo:  "#e3ebff",
  success:   "#16a34a",
  successBg: "#f0fdf4",
  border:    "#e2e8f0",
  muted:     "#64748b",
  bg:        "#f8fafc",
  white:     "#ffffff",
  mono:      "#334155",
};

// ── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    color: C.marinho,
    backgroundColor: C.white,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
  },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  logoArea: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontFamily: "Manrope", fontWeight: 800, fontSize: 18, color: C.marinho },
  logoD: { color: C.azul },
  headerRight: { alignItems: "flex-end", gap: 4 },
  codeLabel: { fontSize: 8, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 1 },
  codeValue: { fontFamily: "Inter", fontWeight: 700, fontSize: 11, color: C.marinho },

  // Divider
  divider: { height: 1, backgroundColor: C.border, marginBottom: 24 },
  dividerBlue: { height: 2, backgroundColor: C.azul, marginBottom: 24 },

  // Badge / Label
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99, backgroundColor: C.azulGelo },
  badgeText: { fontSize: 8, fontWeight: 700, color: C.azul, textTransform: "uppercase", letterSpacing: 0.8 },

  // Título do documento
  docLabel: { fontSize: 8, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  docTitle: { fontFamily: "Manrope", fontWeight: 800, fontSize: 22, color: C.marinho, marginBottom: 4 },
  docSub: { fontSize: 10, color: C.muted },

  // Grid de campos
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 8, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  fieldValue: { fontSize: 10, fontWeight: 500, color: C.marinho },
  fieldValueMono: { fontFamily: "Inter", fontSize: 10, fontWeight: 500, color: C.mono },

  // Declaração
  declarationBox: {
    marginTop: 16,
    marginBottom: 4,
    padding: 12,
    borderRadius: 6,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  declarationLabel: { fontSize: 8, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 },
  declarationText: { fontSize: 9, color: C.marinho, lineHeight: 1.5 },

  // Assinaturas
  sigSection: { marginTop: 24, marginBottom: 16 },
  sigTitle: { fontFamily: "Manrope", fontWeight: 700, fontSize: 11, color: C.marinho, marginBottom: 12 },
  sigGrid: { flexDirection: "row", gap: 12 },
  sigCard: { flex: 1, padding: 12, borderRadius: 6, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  sigName: { fontSize: 10, fontWeight: 600, color: C.marinho, marginBottom: 2 },
  sigRole: { fontSize: 8, color: C.muted, marginBottom: 8 },
  sigLine: { height: 1, backgroundColor: C.border, marginBottom: 6 },
  sigStatus: { flexDirection: "row", alignItems: "center", gap: 4 },
  sigDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success },
  sigDotPending: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#f59e0b" },
  sigDate: { fontSize: 8, color: C.muted },

  // Selo de verificação
  seal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: C.successBg,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  sealLeft: { flex: 1 },
  sealIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.success, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  sealLabel: { fontSize: 8, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  sealCode: { fontFamily: "Inter", fontSize: 12, fontWeight: 700, color: C.success, marginBottom: 2 },
  sealSigs: { fontSize: 8, color: "#15803d" },
  sealQr: { width: 72, height: 72 },

  // Footer
  footer: { position: "absolute", bottom: 32, left: 48, right: 48 },
  footerDivider: { height: 1, backgroundColor: C.border, marginBottom: 10 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 8, color: C.muted },
  footerBold: { fontWeight: 600, color: C.marinho },
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

function fmtDateTime(d: Date): string {
  return `${fmtDate(d)} às ${fmtTime(d)}`;
}

function maskCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function fmtCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "");
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

// ── Tipos ────────────────────────────────────────────────────────────────────
export type CertificateSignature = {
  signerName: string;
  signerRole: "INSTRUCTOR" | "TRAINEE";
  status: "PENDING" | "SIGNED";
  signedAt: Date | null;
};

export type CertificateData = {
  verificationCode: string;
  trainingTypeNameSnapshot: string;
  declarationTextSnapshot: string | null;
  companyNameSnapshot: string;
  companyCnpjSnapshot: string;
  instructorNameSnapshot: string;
  instructorJobTitleSnapshot: string;
  traineeName: string;
  traineeCpf: string;
  clientCompanyName: string;
  contentMinistrado: string | null;
  startsAt: Date;
  endsAt: Date;
  signatures: CertificateSignature[];
  qrCodeDataUrl: string;
  appUrl: string;
};

// ── Componente ───────────────────────────────────────────────────────────────
export function TrainingCertificate({ data }: { data: CertificateData }) {
  const signedCount = data.signatures.filter((s) => s.status === "SIGNED").length;
  const totalCount = data.signatures.length;

  return (
    <Document
      title={`Comprovante ${data.verificationCode}`}
      author="Comproved"
      subject="Comprovante de Treinamento"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.logoArea}>
            <Text style={s.logoText}>
              Comprove<Text style={s.logoD}>d</Text>
            </Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.codeLabel}>Código de verificação</Text>
            <Text style={s.codeValue}>{data.verificationCode}</Text>
            <Text style={[s.codeLabel, { marginTop: 4 }]}>Emitido em</Text>
            <Text style={s.fieldValueMono}>{fmtDateTime(data.startsAt)}</Text>
          </View>
        </View>

        <View style={s.dividerBlue} />

        {/* ── Título ── */}
        <View style={{ marginBottom: 24 }}>
          <View style={[s.badge, { alignSelf: "flex-start", marginBottom: 10 }]}>
            <Text style={s.badgeText}>Comprovante de Treinamento</Text>
          </View>
          <Text style={s.docTitle}>{data.trainingTypeNameSnapshot}</Text>
          <Text style={s.docSub}>
            {fmtDate(data.startsAt)} · {fmtTime(data.startsAt)}–{fmtTime(data.endsAt)} · {data.clientCompanyName}
          </Text>
        </View>

        {/* ── Campos: Empresa e Instrutor ── */}
        <View style={s.grid}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Empresa</Text>
            <Text style={s.fieldValue}>{data.companyNameSnapshot}</Text>
            <Text style={s.fieldValueMono}>{fmtCnpj(data.companyCnpjSnapshot)}</Text>
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Instrutor</Text>
            <Text style={s.fieldValue}>{data.instructorNameSnapshot}</Text>
            <Text style={{ fontSize: 9, color: C.muted }}>{data.instructorJobTitleSnapshot}</Text>
          </View>
        </View>

        {/* ── Campos: Treinando ── */}
        <View style={[s.grid, { marginBottom: 0 }]}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Participante</Text>
            <Text style={s.fieldValue}>{data.traineeName}</Text>
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>CPF</Text>
            <Text style={s.fieldValueMono}>{maskCpf(data.traineeCpf)}</Text>
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Período</Text>
            <Text style={s.fieldValueMono}>
              {fmtDate(data.startsAt)}{"\n"}{fmtTime(data.startsAt)} – {fmtTime(data.endsAt)}
            </Text>
          </View>
        </View>

        {/* ── Declaração / Conteúdo ── */}
        {(data.declarationTextSnapshot || data.contentMinistrado) && (
          <View style={s.declarationBox}>
            {data.declarationTextSnapshot && (
              <>
                <Text style={s.declarationLabel}>Declaração</Text>
                <Text style={s.declarationText}>{data.declarationTextSnapshot}</Text>
              </>
            )}
            {data.contentMinistrado && (
              <>
                <Text style={[s.declarationLabel, data.declarationTextSnapshot ? { marginTop: 8 } : {}]}>
                  Conteúdo ministrado
                </Text>
                <Text style={s.declarationText}>{data.contentMinistrado}</Text>
              </>
            )}
          </View>
        )}

        {/* ── Assinaturas ── */}
        <View style={s.sigSection}>
          <View style={s.divider} />
          <Text style={s.sigTitle}>Assinaturas ({signedCount} de {totalCount})</Text>
          <View style={s.sigGrid}>
            {data.signatures.map((sig, i) => (
              <View key={i} style={s.sigCard}>
                <Text style={s.sigName}>{sig.signerName}</Text>
                <Text style={s.sigRole}>
                  {sig.signerRole === "INSTRUCTOR" ? "Instrutor" : "Participante"}
                </Text>
                <View style={s.sigLine} />
                <View style={s.sigStatus}>
                  <View style={sig.status === "SIGNED" ? s.sigDot : s.sigDotPending} />
                  <Text style={s.sigDate}>
                    {sig.status === "SIGNED" && sig.signedAt
                      ? fmtDateTime(sig.signedAt)
                      : "Pendente"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Selo de verificação ── */}
        <View style={s.seal}>
          <View style={s.sealLeft}>
            <Text style={s.sealLabel}>✓ Documento válido</Text>
            <Text style={s.sealCode}>{data.verificationCode}</Text>
            <Text style={s.sealSigs}>{signedCount} de {totalCount} assinaturas coletadas</Text>
            <Text style={[s.sealSigs, { marginTop: 6 }]}>
              Verifique em: {data.appUrl}/verificar?codigo={data.verificationCode}
            </Text>
          </View>
          <Image src={data.qrCodeDataUrl} style={s.sealQr} />
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <View style={s.footerDivider} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>
              <Text style={s.footerBold}>Comproved</Text>
              {" · "}Registro e verificação de treinamentos
            </Text>
            <Text style={s.footerText}>{data.verificationCode}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
