import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@src/state/auth-store";
import { useRouter } from "expo-router";
import { MobileService } from "@src/services/mobile.service";
import { MobileAccountData, MobileBillingData, MobileConsumptionData } from "@src/api/types/mobile";
import BillingChart from "@src/screens/home/components/ui/billing-chart";
import BillingTable from "@src/screens/home/components/ui/billing-table";
import ConsumptionChart from "@src/screens/home/components/ui/consumption-chart";
import ConsumptionTable from "@src/screens/home/components/ui/consumption-table";
import YearPicker from "@src/screens/home/components/ui/year-picker";
import { TABLE_BODY_HEIGHT } from "@src/screens/home/utils/layout";

export default function HomeScreen() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [meterInfo, setMeterInfo] = useState<MobileAccountData["meter"] | null>(null);
  const [consumption, setConsumption] = useState<MobileConsumptionData | null>(null);
  const [consumptionTab, setConsumptionTab] = useState<"chart" | "table">("chart");
  const [billing, setBilling] = useState<MobileBillingData | null>(null);
  const [billingTab, setBillingTab] = useState<"chart" | "table">("chart");
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Field operator";
  const isConsumer = user?.role === "consumer";
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [billingYear, setBillingYear] = useState(currentYear);
  const minYear = currentYear - 10;

  const handleComingSoon = (label: string) => {
    Alert.alert("Coming soon", `${label} is not available yet.`);
  };

  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      const result = await MobileService.getAccount();
      if (active && result.success) {
        setMeterInfo(result.data.meter);
      }
    };
    loadAccount();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isConsumer) return;
    let active = true;
    const loadConsumption = async () => {
      const result = await MobileService.getConsumption(selectedYear);
      if (active && result.success) {
        setConsumption(result.data);
      }
    };
    loadConsumption();
    return () => {
      active = false;
    };
  }, [isConsumer, selectedYear]);

  useEffect(() => {
    if (!isConsumer) return;
    let active = true;
    const loadBilling = async () => {
      const result = await MobileService.getBilling(billingYear);
      if (active && result.success) {
        setBilling(result.data);
      }
    };
    loadBilling();
    return () => {
      active = false;
    };
  }, [billingYear, isConsumer]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Welcome back</Text>
            <Text style={styles.title}>{displayName}</Text>
            <Text style={styles.subtitle}>Meter inspector dashboard</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={clearSession}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        {isConsumer ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Consumption</Text>
              <YearPicker value={selectedYear} minYear={minYear} maxYear={currentYear} onChange={setSelectedYear} />
            </View>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabButton, consumptionTab === "chart" ? styles.tabButtonActive : null]}
                onPress={() => setConsumptionTab("chart")}
              >
                <Text
                  style={[
                    styles.tabText,
                    consumptionTab === "chart" ? styles.tabTextActive : null,
                  ]}
                >
                  Chart
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, consumptionTab === "table" ? styles.tabButtonActive : null]}
                onPress={() => setConsumptionTab("table")}
              >
                <Text
                  style={[
                    styles.tabText,
                    consumptionTab === "table" ? styles.tabTextActive : null,
                  ]}
                >
                  Table
                </Text>
              </TouchableOpacity>
            </View>

            {consumptionTab === "chart" ? (
              <View style={styles.chartCard}>
                <ConsumptionChart data={consumption?.chart ?? []} />
              </View>
            ) : (
              <View style={styles.tableCard}>
                <ConsumptionTable rows={consumption?.rows ?? []} />
              </View>
            )}
          </View>
        ) : null}

        {isConsumer ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Billing</Text>
              <YearPicker value={billingYear} minYear={minYear} maxYear={currentYear} onChange={setBillingYear} />
            </View>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabButton, billingTab === "chart" ? styles.tabButtonActive : null]}
                onPress={() => setBillingTab("chart")}
              >
                <Text
                  style={[
                    styles.tabText,
                    billingTab === "chart" ? styles.tabTextActive : null,
                  ]}
                >
                  Chart
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, billingTab === "table" ? styles.tabButtonActive : null]}
                onPress={() => setBillingTab("table")}
              >
                <Text
                  style={[
                    styles.tabText,
                    billingTab === "table" ? styles.tabTextActive : null,
                  ]}
                >
                  Table
                </Text>
              </TouchableOpacity>
            </View>

            {billingTab === "chart" ? (
              <View style={styles.chartCard}>
                <BillingChart data={billing?.chart ?? []} />
              </View>
            ) : (
              <View style={styles.tableCard}>
                <BillingTable rows={billing?.rows ?? []} />
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleComingSoon("Start reading")}>
            <Text style={styles.actionTitle}>Start reading</Text>
            <Text style={styles.actionSubtitle}>Begin your meter route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleComingSoon("Manual entry")}>
            <Text style={styles.actionTitle}>Manual entry</Text>
            <Text style={styles.actionSubtitle}>Add a reading without a route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleComingSoon("Sync data")}>
            <Text style={styles.actionTitle}>Sync data</Text>
            <Text style={styles.actionSubtitle}>Upload pending readings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email ?? "-"}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => router.push("/profile-edit")}>
              <Text style={styles.editButtonText}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isConsumer ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Serial number</Text>
                <Text style={styles.infoValue}>{meterInfo?.serialNumber ?? "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Shared</Text>
                <Text style={styles.infoValue}>{formatShared(meterInfo?.shared)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{meterInfo?.status ?? "-"}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const formatShared = (value?: boolean) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "-";
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 20, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  kicker: { color: "#5a6b95", fontSize: 12, fontWeight: "600" },
  title: { color: "#1f2a44", fontSize: 22, fontWeight: "700", marginTop: 4 },
  subtitle: { color: "#6b7aa6", fontSize: 13, marginTop: 6 },
  logoutButton: {
    backgroundColor: "#e9edfb",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: { color: "#3a4c7a", fontSize: 12, fontWeight: "600" },
  section: { marginBottom: 22 },
  sectionTitle: { color: "#2b3a67", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
  emptyText: { color: "#6b7aa6", fontSize: 12, marginTop: 8 },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    marginBottom: 12,
  },
  actionTitle: { color: "#1f2a44", fontSize: 15, fontWeight: "700" },
  actionSubtitle: { color: "#6b7aa6", fontSize: 12, marginTop: 6 },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    paddingBottom: 48,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  infoLabel: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
  infoValue: { color: "#1f2a44", fontSize: 12, fontWeight: "600" },
  editButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "#e9edfb",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  editButtonText: { color: "#3a4c7a", fontSize: 12, fontWeight: "600" },
});
