import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import ScrollScreen from "@src/components/layout/scroll-screen";
import SubmitButton from "@src/components/ui/submit-button";
import { MobileService } from "@src/services/mobile.service";
import { MobilePaymentInvoice } from "@src/api/types/mobile";
import { useRouter } from "expo-router";
import { useNotificationsStore } from "@src/state/notifications-store";

export default function PaymentScreen() {
  const router = useRouter();
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
      Alert.alert("Payment failed", result.message);
      return;
    }
    setHasIssuedInvoice(false);
    refreshNotifications().catch(() => null);
    Alert.alert("Success", "Payment submitted successfully.", [
      {
        text: "OK",
        onPress: () => {
          router.replace("/home");
        },
      },
    ]);
  };

  return (
    <ScrollScreen title="Invoice payment" contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Latest invoice</Text>
        {loading ? <Text style={styles.subtle}>Loading invoice...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && !invoice ? (
          <Text style={styles.subtle}>No issued invoices yet.</Text>
        ) : null}
        {!loading && !error && invoice ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Meter</Text>
              <Text style={styles.value}>{invoice.meterSerialNumber ?? "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Period</Text>
              <Text style={styles.value}>{formatPeriod(invoice.periodStart, invoice.periodEnd)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Previous reading</Text>
              <Text style={styles.value}>{formatReading(invoice.previousValue)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Current reading</Text>
              <Text style={styles.value}>{formatReading(invoice.currentValue)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Consumption</Text>
              <Text style={styles.value}>{invoice.consumption}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Unit price</Text>
              <Text style={styles.value}>{formatAmount(invoice.unitPrice)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>{formatAmount(invoice.subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>VAT rate</Text>
              <Text style={styles.value}>{formatPercent(invoice.vatRate)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>VAT amount</Text>
              <Text style={styles.value}>{formatAmount(invoice.vatAmount)}</Text>
            </View>
            <View style={styles.rowTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatAmount(invoice.totalAmount)}</Text>
            </View>

            {invoice.lines.length ? (
              <View style={styles.lines}>
                <Text style={styles.linesTitle}>Line items</Text>
                {invoice.lines.map((line) => (
                  <View key={line.id} style={styles.lineRow}>
                    <View>
                      <Text style={styles.lineLabel}>{formatLineType(line.type)}</Text>
                      {line.description ? <Text style={styles.lineDescription}>{line.description}</Text> : null}
                    </View>
                    <View style={styles.lineMeta}>
                      <Text style={styles.lineAmount}>{formatAmount(line.amount)}</Text>
                      {line.quantity != null && line.unitPrice != null ? (
                        <Text style={styles.lineQuantity}>
                          {line.quantity} x {formatAmount(line.unitPrice)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <SubmitButton
              label="Submit payment"
              loadingLabel="Submitting..."
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

const formatAmount = (value: number) => `${value.toFixed(2)}`;

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const formatReading = (value: number | null) => (value === null ? "-" : `${value}`);

const formatLineType = (type: MobilePaymentInvoice["lines"][number]["type"]) => {
  if (type === "consumption") return "Consumption";
  if (type === "vat") return "VAT";
  return "Fee";
};

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
