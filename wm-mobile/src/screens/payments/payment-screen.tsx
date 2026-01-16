import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import ScrollScreen from "@src/components/layout/scroll-screen";
import SubmitButton from "@src/components/ui/submit-button";
import { MobileService } from "@src/services/mobile.service";
import { MobileCompanyProfile, MobilePaymentInvoice } from "@src/api/types/mobile";
import { useRouter } from "expo-router";
import { useNotificationsStore } from "@src/state/notifications-store";
import { useTranslation } from "@src/hooks/use-translation";
import { formatCurrencyValue } from "@src/utils/format-currency";

export default function PaymentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  const refreshNotifications = useNotificationsStore((state) => state.refreshNotifications);
  const setHasIssuedInvoice = useNotificationsStore((state) => state.setHasIssuedInvoice);
  const [invoice, setInvoice] = useState<MobilePaymentInvoice | null>(null);
  const [company, setCompany] = useState<MobileCompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPayment = async () => {
    setLoading(true);
    const result = await MobileService.getPayment();
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setError(null);
    setInvoice(result.data.invoice);
    setCompany(result.data.company);
  };

  useEffect(() => {
    let active = true;
    loadPayment().catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  const handleSubmitPayment = async () => {
    if (!invoice) return;
    setSubmitting(true);
    const result = await MobileService.payInvoice(invoice.id);
    setSubmitting(false);
    if (!result.success) {
      Alert.alert(t("payment.alert.failedTitle"), result.message);
      return;
    }
    setHasIssuedInvoice(false);
    refreshNotifications().catch(() => null);
    Alert.alert(t("payment.alert.successTitle"), t("payment.alert.successMessage"), [
      {
        text: t("common.ok"),
        onPress: () => {
          router.replace("/home");
        },
      },
    ]);
  };

  const formatLineTypeLabel = (type: MobilePaymentInvoice["lines"][number]["type"]) => {
    if (type === "consumption") return t("payment.line.consumption");
    if (type === "vat") return t("payment.line.vat");
    return t("payment.line.fee");
  };

  const companyLocation =
    company && (company.zip || company.city)
      ? `${company.zip}${company.zip && company.city ? " " : ""}${company.city}`
      : "";
  const companyLogoUri =
    company?.logoUrl
      ? company.logoUrl.startsWith("http")
        ? company.logoUrl
        : `${apiBaseUrl}${company.logoUrl}`
      : null;

  const summaryRows = invoice
    ? [
        {
          key: "meter",
          label: t("payment.label.meter"),
          detail: "",
          amount: invoice.meterSerialNumber ?? "-",
          spanAmount: true,
        },
        {
          key: "previous",
          label: t("payment.label.previousReading"),
          detail: formatDate(invoice.periodStart),
          amount: formatReading(invoice.previousValue),
        },
        {
          key: "current",
          label: t("payment.label.currentReading"),
          detail: formatDate(invoice.periodEnd),
          amount: formatReading(invoice.currentValue),
        },
        {
          key: "consumption",
          label: t("payment.label.consumption"),
          detail: `${invoice.consumption} x ${formatCurrencyValue(invoice.unitPrice, invoice.currency)}`,
          amount: formatCurrencyValue(invoice.subtotal, invoice.currency),
          isEmphasized: true,
        },
        ...invoice.lines
          .filter((line) => line.type !== "consumption")
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((line) => {
            const valueLabel =
              line.isPercentage && line.value != null
                ? `${line.value}%`
                : line.value != null
                  ? formatCurrencyValue(line.value, invoice.currency)
                  : line.type === "vat"
                    ? formatPercent(invoice.vatRate)
                    : line.unitPrice != null
                      ? formatCurrencyValue(line.unitPrice, invoice.currency)
                      : "-";

            return {
              key: line.id,
              label: line.description || formatLineTypeLabel(line.type),
              detail: valueLabel,
              amount: formatCurrencyValue(line.amount, invoice.currency),
            };
          }),
      ]
    : [];

  return (
    <ScrollScreen title={t("payment.title")} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {loading ? <Text style={styles.subtle}>{t("payment.loadingInvoice")}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && !invoice ? (
          <Text style={styles.subtle}>{t("payment.noIssued")}</Text>
        ) : null}
        {!loading && !error && invoice ? (
          <>
            {company ? (
              <View style={styles.companyHeader}>
                {companyLogoUri ? (
                  <Image source={{ uri: companyLogoUri }} style={styles.companyLogo} resizeMode="contain" />
                ) : null}
                <View style={styles.companyDetails}>
                  <Text style={styles.companyName}>{company.name || t("payment.company.fallbackName")}</Text>
                  {companyLocation || company.address ? (
                    <Text style={styles.companyAddress}>
                      {[companyLocation, company.address].filter(Boolean).join(", ")}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.companyMeta}>
                  {company.registrationNumber ? (
                    <Text style={styles.companyMetaText}>
                      {t("payment.company.registrationNumber")}: {company.registrationNumber}
                    </Text>
                  ) : null}
                  {company.companyNumber ? (
                    <Text style={styles.companyMetaText}>
                      {t("payment.company.companyNumber")}: {company.companyNumber}
                    </Text>
                  ) : null}
                  {company.taxId ? (
                    <Text style={styles.companyMetaText}>
                      {t("payment.company.taxId")}: {company.taxId}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <View style={styles.table}>
              {summaryRows.map((row) => (
                <View
                  key={row.key}
                  style={[styles.tableRow, row.isEmphasized ? styles.tableRowEmphasized : null]}
                >
                  <Text style={[styles.tableCell, styles.cellLabel]}>{row.label}</Text>
                  <Text style={[styles.tableCell, styles.cellDetail]}>{row.detail}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      row.spanAmount ? styles.cellAmountSpan : styles.cellAmount,
                    ]}
                  >
                    {row.amount}
                  </Text>
                </View>
              ))}
              <View style={styles.tableFooter}>
                <Text style={[styles.totalLabel, styles.cellLabel]}>{t("payment.label.total")}</Text>
                <Text style={[styles.cellDetail]} />
                <Text style={[styles.totalValue, styles.cellAmountSpan]}>
                  {formatCurrencyValue(invoice.totalAmount, invoice.currency)}
                </Text>
              </View>
            </View>

            <SubmitButton
              label={t("payment.action.submit")}
              loadingLabel={t("payment.action.submitting")}
              loading={submitting}
              disabled={submitting}
              onPress={handleSubmitPayment}
              style={styles.submitButton}
            />
          </>
        ) : null}
      </View>
    </ScrollScreen>
  );
}

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const formatReading = (value: number | null) => (value === null ? "-" : `${value}`);

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

const styles = StyleSheet.create({
  content: { padding: 4 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  title: { color: "#1f2a44", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  subtle: { color: "#6b7aa6", fontSize: 12, marginTop: 8 },
  error: { color: "#b23a3a", fontSize: 12, marginTop: 8 },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  companyLogo: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  companyDetails: { flex: 1, marginRight: 12 },
  companyName: { color: "#1f2a44", fontSize: 16, fontWeight: "700" },
  companyAddress: { color: "#6b7aa6", fontSize: 12, marginTop: 2 },
  companyMeta: { alignItems: "flex-end" },
  companyMetaText: { color: "#1f2a44", fontSize: 11, fontWeight: "600" },
  table: {
    borderWidth: 1,
    borderColor: "#e1e6f3",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eef1fb",
  },
  tableHeaderRow: {
    backgroundColor: "#f4f6fb",
  },
  tableRowEmphasized: {
    backgroundColor: "#fbfcff",
  },
  tableHeader: { color: "#6b7aa6", fontSize: 11, fontWeight: "700" },
  tableCell: { color: "#1f2a44", fontSize: 12, fontWeight: "600" },
  cellLabel: { flex: 2 },
  cellDetail: { flex: 1.6, textAlign: "left" },
  cellAmount: { flex: 1.2, textAlign: "right" },
  cellAmountSpan: { flex: 2.8, textAlign: "right" },
  tableFooter: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
  },
  totalLabel: { color: "#1f2a44", fontSize: 14, fontWeight: "700" },
  totalValue: { color: "#1f2a44", fontSize: 14, fontWeight: "700" },
  submitButton: { marginTop: 16 },
});
