import { StyleSheet, Text, View } from "react-native";
import { MobileBillingData } from "@src/api/types/mobile";
import { buildTicks } from "@src/screens/home/utils/chart";
import { CHART_BAR_AREA_HEIGHT, monthLabels } from "@src/screens/home/utils/layout";
import { formatCurrencyValue } from "@src/utils/format-currency";

type BillingChartProps = {
  data: MobileBillingData["chart"];
  currency?: string | null;
};

export default function BillingChart({ data, currency }: BillingChartProps) {
  const maxValue = data.reduce((max, item) => (item.amount > max ? item.amount : max), 0);
  const { maxScale, ticks } = buildTicks(maxValue, 10);

  return (
    <View>
      <View style={styles.chartRow}>
        <View style={styles.chartYAxis}>
          {ticks.map((value, index) => (
            <View key={`${value}-${index}`} style={styles.chartTick}>
              <Text style={styles.chartTickLabel}>
                {value === 0 ? "" : formatCurrencyValue(value, currency)}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.chartBars}>
          {data.map((item) => {
            const height =
              maxScale > 0 ? Math.max(6, (item.amount / maxScale) * CHART_BAR_AREA_HEIGHT) : 6;
            return (
              <View key={item.month} style={styles.chartBarItem}>
                <View style={[styles.chartBar, { height }]} />
                <Text style={styles.chartLabel}>{monthLabels[item.month - 1]}</Text>
              </View>
            );
          })}
        </View>
      </View>
      {!data.length ? <Text style={styles.emptyText}>No billing data yet.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chartRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  chartYAxis: { width: 28, height: CHART_BAR_AREA_HEIGHT, justifyContent: "space-between" },
  chartTick: { alignItems: "flex-end" },
  chartTickLabel: { color: "#6b7aa6", fontSize: 10 },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
    height: CHART_BAR_AREA_HEIGHT,
    flex: 1,
  },
  chartBarItem: { alignItems: "center", flex: 1 },
  chartBar: { width: "100%", backgroundColor: "#3a4c7a", borderRadius: 8 },
  chartLabel: { color: "#6b7aa6", fontSize: 10, marginTop: 6 },
  emptyText: { color: "#6b7aa6", fontSize: 12, marginTop: 8 },
});
