import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MobileBillingData } from "@src/api/types/mobile";
import BillingChart from "@src/screens/home/components/ui/billing-chart";
import BillingTable from "@src/screens/home/components/ui/billing-table";
import YearPicker from "@src/screens/home/components/ui/year-picker";
import { TABLE_BODY_HEIGHT } from "@src/screens/home/utils/layout";
import { useTranslation } from "@src/hooks/use-translation";

type BillingSectionProps = {
  data: MobileBillingData | null;
  tab: "chart" | "table";
  selectedYear: number;
  minYear: number;
  maxYear: number;
  refreshing: boolean;
  onTabChange: (value: "chart" | "table") => void;
  onYearChange: (year: number) => void;
  onRefresh: () => void;
};

export default function BillingSection({
  data,
  tab,
  selectedYear,
  minYear,
  maxYear,
  refreshing,
  onTabChange,
  onYearChange,
  onRefresh,
}: BillingSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("home.billing.title")}</Text>
        <View style={styles.sectionActions}>
          <YearPicker value={selectedYear} minYear={minYear} maxYear={maxYear} onChange={onYearChange} />
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing}>
            <Text style={styles.refreshText}>
              {refreshing ? t("home.common.refreshing") : t("home.common.refresh")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "chart" ? styles.tabButtonActive : null]}
          onPress={() => onTabChange("chart")}
        >
          <Text style={[styles.tabText, tab === "chart" ? styles.tabTextActive : null]}>
            {t("home.common.chart")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "table" ? styles.tabButtonActive : null]}
          onPress={() => onTabChange("table")}
        >
          <Text style={[styles.tabText, tab === "table" ? styles.tabTextActive : null]}>
            {t("home.common.table")}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "chart" ? (
        <View style={styles.chartCard}>
          <BillingChart data={data?.chart ?? []} />
        </View>
      ) : (
        <View style={styles.tableCard}>
          <BillingTable rows={data?.rows ?? []} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  sectionTitle: { color: "#2b3a67", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  refreshButton: {
    backgroundColor: "#e9edfb",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  refreshText: { color: "#3a4c7a", fontSize: 11, fontWeight: "600" },
  tabs: { flexDirection: "row", gap: 8, marginTop: 10 },
  tabButton: {
    backgroundColor: "#e9edfb",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tabButtonActive: { backgroundColor: "#3a4c7a" },
  tabText: { color: "#3a4c7a", fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#ffffff" },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    minHeight: TABLE_BODY_HEIGHT,
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
});
