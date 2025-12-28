import { StyleSheet, Text, View } from "react-native";
import { MobileConsumptionData } from "@src/api/types/mobile";
import { buildTicks } from "@src/screens/home/utils/chart";
import { CHART_BAR_AREA_HEIGHT, monthLabels } from "@src/screens/home/utils/layout";

type ConsumptionChartProps = {
  data: MobileConsumptionData["chart"];
};

export default function ConsumptionChart({ data }: ConsumptionChartProps) {
  const maxValue = data.reduce((max, item) => (item.consumption > max ? item.consumption : max), 0);
  const { maxScale, ticks } = buildTicks(maxValue, 10);

  return (
    <View>
      <View style={styles.chartRow}>
        <View style={styles.chartYAxis}>
          {ticks.map((value, index) => (
            <View key={`${value}-${index}`} style={styles.chartTick}>
              <Text style={styles.chartTickLabel}>{value === 0 ? "" : value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartBars}>
          {data.map((item) => {
            const isNegative = item.consumption < 0;
            const height =
              maxScale > 0
                ? Math.max(6, (Math.max(0, item.consumption) / maxScale) * CHART_BAR_AREA_HEIGHT)
                : 6;
            return (
              <View key={item.month} style={styles.chartBarItem}>
                <View
                  style={[
                    styles.chartBar,
                    isNegative ? styles.chartBarError : null,
                    { height },
                  ]}
                />
                <Text style={styles.chartLabel}>{monthLabels[item.month - 1]}</Text>
              </View>
            );
          })}
        </View>
      </View>
      {!data.length ? <Text style={styles.emptyText}>No consumption data yet.</Text> : null}
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
  chartBarError: { backgroundColor: "#ef233c" },
  chartLabel: { color: "#6b7aa6", fontSize: 10, marginTop: 6 },
  emptyText: { color: "#6b7aa6", fontSize: 12, marginTop: 8 },
});
