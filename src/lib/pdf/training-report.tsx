import {
  Document,
  Page,
  Text,
  View,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2", fontWeight: 700 },
  ],
});

export type ReportRow = {
  traineeName: string;
  traineeCpf: string;
  clientCompanyName: string;
  trainingTypeName: string;
  instructorName: string;
  startsAt: string;
  endsAt: string;
  hours: number;
  status: string;
  verificationCode: string;
};

export type ReportData = {
  companyName: string;
  generatedAt: string;
  rows: ReportRow[];
};

const BRAND = "#2a5bff";
const DARK  = "#0f1a2e";
const MUTED = "#677489";
const BORDER = "#dce2ec";
const BG_HEAD = "#f4f6fa";

const s = StyleSheet.create({
  page:    { fontFamily: "Inter", fontSize: 8, color: DARK, padding: "32 40 40 40", backgroundColor: "#ffffff" },
  header:  { marginBottom: 20 },
  title:   { fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 2 },
  subtitle:{ fontSize: 9, color: MUTED },
  badge:   { fontSize: 7, fontWeight: 600, color: "#fff", backgroundColor: BRAND, borderRadius: 4, padding: "2 6", alignSelf: "flex-start", marginTop: 6 },

  table:   { width: "100%" },
  thead:   { flexDirection: "row", backgroundColor: BG_HEAD, borderTopWidth: 1, borderBottomWidth: 1, borderColor: BORDER, paddingVertical: 5 },
  th:      { fontWeight: 600, color: MUTED, fontSize: 7, textTransform: "uppercase", letterSpacing: 0.5, paddingHorizontal: 6 },
  row:     { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER, paddingVertical: 6, alignItems: "center" },
  td:      { paddingHorizontal: 6, color: DARK },
  tdMuted: { paddingHorizontal: 6, color: MUTED },
  tdMono:  { paddingHorizontal: 6, color: MUTED, fontFamily: "Inter" },

  // col widths
  cName:   { width: "16%" },
  cClient: { width: "14%" },
  cType:   { width: "14%" },
  cInstr:  { width: "13%" },
  cPeriod: { width: "16%" },
  cHours:  { width: "7%"  },
  cStatus: { width: "10%" },
  cCode:   { width: "10%" },

  statusIssued:   { color: "#0b7a53", fontWeight: 600 },
  statusCanceled: { color: "#c2283b", fontWeight: 600 },

  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: MUTED },
});

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function fmtHours(h: number) {
  if (h === Math.floor(h)) return `${h}h`;
  return `${h.toFixed(1)}h`;
}

function statusLabel(s: string) {
  if (s === "ISSUED") return "Emitido";
  if (s === "CANCELED") return "Cancelado";
  return s;
}

export function TrainingReport({ data }: { data: ReportData }) {
  return (
    <Document title={`Relatório de treinamentos — ${data.companyName}`}>
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Relatório de treinamentos</Text>
          <Text style={s.subtitle}>{data.companyName} · Gerado em {data.generatedAt}</Text>
          <View style={s.badge}>
            <Text>{data.rows.length} treinamento{data.rows.length !== 1 ? "s" : ""}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.th, s.cName]}>Treinando</Text>
            <Text style={[s.th, s.cClient]}>Empresa cliente</Text>
            <Text style={[s.th, s.cType]}>Tipo</Text>
            <Text style={[s.th, s.cInstr]}>Instrutor</Text>
            <Text style={[s.th, s.cPeriod]}>Período</Text>
            <Text style={[s.th, s.cHours]}>Horas</Text>
            <Text style={[s.th, s.cStatus]}>Status</Text>
            <Text style={[s.th, s.cCode]}>Código</Text>
          </View>

          {data.rows.map((r, i) => (
            <View key={i} style={[s.row, { backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafc" }]}>
              <View style={s.cName}>
                <Text style={s.td}>{r.traineeName}</Text>
                {r.traineeCpf && <Text style={s.tdMuted}>{r.traineeCpf}</Text>}
              </View>
              <Text style={[s.tdMuted, s.cClient]}>{r.clientCompanyName}</Text>
              <Text style={[s.td, s.cType]}>{r.trainingTypeName}</Text>
              <Text style={[s.tdMuted, s.cInstr]}>{r.instructorName}</Text>
              <Text style={[s.tdMono, s.cPeriod]}>{fmt(r.startsAt)} – {fmt(r.endsAt)}</Text>
              <Text style={[s.tdMono, s.cHours]}>{fmtHours(r.hours)}</Text>
              <Text style={[r.status === "ISSUED" ? s.statusIssued : s.statusCanceled, s.td, s.cStatus]}>
                {statusLabel(r.status)}
              </Text>
              <Text style={[s.tdMono, s.cCode]}>{r.verificationCode}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Comproved · comproved.com.br</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
