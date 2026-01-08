import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MobileStaffMeter } from "@src/api/types/mobile";
import { useTranslation } from "@src/hooks/use-translation";

type StaffMetersSectionProps = {
  meters: MobileStaffMeter[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectMeter: (meterId: string) => void;
};

const compareText = (value: string | null) => value?.toLowerCase() ?? "";

export default function StaffMetersSection({
  meters,
  loading,
  error,
  onRefresh,
  onSelectMeter,
}: StaffMetersSectionProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const sortedMeters = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const filtered = trimmed
      ? meters.filter((meter) => {
          const matchSerial = meter.serialNumber.toLowerCase().includes(trimmed);
          const matchAddress = compareText(meter.address).includes(trimmed);
          const matchConsumer = meter.consumers.some((consumer) => {
            const name = `${consumer.firstName} ${consumer.lastName}`.toLowerCase();
            return name.includes(trimmed);
          });
          return matchSerial || matchAddress || matchConsumer;
        })
      : meters;

    const items = filtered.slice();
    return items.sort((a, b) => {
      if (b.consumerCount !== a.consumerCount) {
        return b.consumerCount - a.consumerCount;
      }
      const aAddress = compareText(a.address);
      const bAddress = compareText(b.address);
      if (aAddress !== bAddress) {
        return aAddress.localeCompare(bAddress);
      }
      return a.serialNumber.localeCompare(b.serialNumber);
    });
  }, [meters, query]);

  const formatConsumerCount = (count: number) =>
    `${count} ${count === 1 ? t("home.staff.consumer") : t("home.staff.consumers")}`;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("home.staff.title")}</Text>
        <View style={styles.sectionActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={loading}>
            <Text style={styles.refreshText}>
              {loading ? t("home.common.refreshing") : t("home.common.refresh")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder={t("home.staff.searchPlaceholder")}
        placeholderTextColor="#a8b3d1"
        autoCapitalize="none"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? <Text style={styles.helperText}>{t("home.staff.loading")}</Text> : null}
      {!loading && !error && sortedMeters.length === 0 ? (
        <Text style={styles.helperText}>{t("home.staff.empty")}</Text>
      ) : null}

      {sortedMeters.map((meter) => (
        <TouchableOpacity key={meter.id} style={styles.card} onPress={() => onSelectMeter(meter.id)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{meter.serialNumber}</Text>
            <Text style={styles.cardBadge}>{formatConsumerCount(meter.consumerCount)}</Text>
          </View>
          <Text style={styles.cardMeta}>{meter.address ?? t("home.staff.addressMissing")}</Text>
          {meter.consumers.map((consumer) => (
            <View key={consumer.id} style={styles.consumerRow}>
              <Text style={styles.consumerName}>
                {consumer.firstName} {consumer.lastName}
              </Text>
              {consumer.householdSize ? (
                <Text style={styles.consumerMeta}>
                  {t("home.staff.household")} {consumer.householdSize}
                </Text>
              ) : null}
            </View>
          ))}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  sectionTitle: { color: "#2b3a67", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  sectionHeader: { gap: 12, marginBottom: 12 },
  sectionActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  refreshButton: {
    backgroundColor: "#e9edfb",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  refreshText: { color: "#3a4c7a", fontSize: 11, fontWeight: "600" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e1e6f3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1f2a44",
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  helperText: { color: "#6b7aa6", fontSize: 12, marginBottom: 8 },
  errorText: { color: "#b23a3a", fontSize: 12, marginBottom: 8 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: "#1f2a44", fontSize: 14, fontWeight: "700" },
  cardBadge: {
    color: "#3a4c7a",
    fontSize: 11,
    fontWeight: "600",
    backgroundColor: "#e9edfb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  cardMeta: { color: "#6b7aa6", fontSize: 12, marginTop: 6, marginBottom: 6 },
  consumerRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  consumerName: { color: "#1f2a44", fontSize: 12, fontWeight: "600" },
  consumerMeta: { color: "#6b7aa6", fontSize: 11 },
});
