import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import ScrollScreen from "@src/components/layout/scroll-screen";
import SubmitButton from "@src/components/ui/submit-button";
import { MobileService } from "@src/services/mobile.service";
import { MobilePaymentInvoice } from "@src/api/types/mobile";
import { useRouter } from "expo-router";
import { useNotificationsStore } from "@src/state/notifications-store";
import { useTranslation } from "@src/hooks/use-translation";
import { formatCurrencyValue } from "@src/utils/format-currency";

export default function PaymentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const refreshNotifications = useNotificationsStore((state) => state.refreshNotifications);
  const setHasIssuedInvoice = useNotificationsStore((state) => state.setHasIssuedInvoice);
  const [invoice, setInvoice] = useState<MobilePaymentInvoice | null>(null);
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

  return (
    <ScrollScreen title={t("payment.title")} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("payment.latestInvoice")}</Text>
        {loading ? <Text style={styles.subtle}>{t("payment.loadingInvoice")}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && !invoice ? (
          <Text style={styles.subtle}>{t("payment.noIssued")}</Text>
        ) : null}
        {!loading && !error && invoice ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.meter")}</Text>
              <Text style={styles.value}>{invoice.meterSerialNumber ?? "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.period")}</Text>
              <Text style={styles.value}>{formatPeriod(invoice.periodStart, invoice.periodEnd)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.previousReading")}</Text>
              <Text style={styles.value}>{formatReading(invoice.previousValue)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.currentReading")}</Text>
              <Text style={styles.value}>{formatReading(invoice.currentValue)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.consumption")}</Text>
              <Text style={styles.value}>{invoice.consumption}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.unitPrice")}</Text>
              <Text style={styles.value}>{formatCurrencyValue(invoice.unitPrice, invoice.currency)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.subtotal")}</Text>
              <Text style={styles.value}>{formatCurrencyValue(invoice.subtotal, invoice.currency)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.vatRate")}</Text>
              <Text style={styles.value}>{formatPercent(invoice.vatRate)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("payment.label.vatAmount")}</Text>
              <Text style={styles.value}>{formatCurrencyValue(invoice.vatAmount, invoice.currency)}</Text>
            </View>
            <View style={styles.rowTotal}>
              <Text style={styles.totalLabel}>{t("payment.label.total")}</Text>
              <Text style={styles.totalValue}>{formatCurrencyValue(invoice.totalAmount, invoice.currency)}</Text>
            </View>

            {invoice.lines.length ? (
              <View style={styles.lines}>
                <Text style={styles.linesTitle}>{t("payment.lines.title")}</Text>
                {invoice.lines.map((line) => (
                  <View key={line.id} style={styles.lineRow}>
                    <View>
                      <Text style={styles.lineLabel}>{formatLineTypeLabel(line.type)}</Text>
                      {line.description ? <Text style={styles.lineDescription}>{line.description}</Text> : null}
                    </View>
                    <View style={styles.lineMeta}>
                      <Text style={styles.lineAmount}>{formatCurrencyValue(line.amount, invoice.currency)}</Text>
                      {line.quantity != null && line.unitPrice != null ? (
                        <Text style={styles.lineQuantity}>
                          {line.quantity} x {formatCurrencyValue(line.unitPrice, invoice.currency)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

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

const formatPeriod = (start: string | null, end: string | null) => {
  if (!start && !end) return "-";
  const startLabel = start ? new Date(start).toLocaleDateString() : "-";
  const endLabel = end ? new Date(end).toLocaleDateString() : "-";
  return `${startLabel} - ${endLabel}`;
};

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const formatReading = (value: number | null) => (value === null ? "-" : `${value}`);

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  title: { color: "#1f2a44", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  label: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
  value: { color: "#1f2a44", fontSize: 12, fontWeight: "600" },
  rowTotal: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e6f3",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: { color: "#1f2a44", fontSize: 14, fontWeight: "700" },
  totalValue: { color: "#1f2a44", fontSize: 14, fontWeight: "700" },
  subtle: { color: "#6b7aa6", fontSize: 12, marginTop: 8 },
  error: { color: "#b23a3a", fontSize: 12, marginTop: 8 },
  lines: { marginTop: 16 },
  linesTitle: { color: "#1f2a44", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef1fb",
  },
  lineLabel: { color: "#3a4c7a", fontSize: 12, fontWeight: "600" },
  lineDescription: { color: "#6b7aa6", fontSize: 11, marginTop: 2 },
  lineMeta: { alignItems: "flex-end" },
  lineAmount: { color: "#1f2a44", fontSize: 12, fontWeight: "600" },
  lineQuantity: { color: "#6b7aa6", fontSize: 11, marginTop: 2 },
  submitButton: { marginTop: 16 },
});
