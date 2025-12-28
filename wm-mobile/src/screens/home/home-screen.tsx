import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  const [showNotifications, setShowNotifications] = useState(false);
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Field operator";
  const isConsumer = user?.role === "consumer";
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [billingYear, setBillingYear] = useState(currentYear);
  const minYear = currentYear - 10;
  const notifications = [
    {
      id: "invalid_reading",
      title: "Invalid reading detected",
      description: "Please review your last entry.",
      tone: "error",
    },
    {
      id: "no_reading",
      title: "No reading this period",
      description: "Submit a reading to avoid delays.",
      tone: "warning",
    },
    {
      id: "invoice_issued",
      title: "Invoice issued",
      description: "Your latest invoice is ready.",
      tone: "info",
    },
  ];
  const hasNotifications = notifications.length > 0;

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
      {showNotifications ? (
        <Pressable style={styles.overlay} onPress={() => setShowNotifications(false)} />
      ) : null}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Water Meter</Text>
            <Text style={styles.subtitle}>Mobile dashboard</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (!hasNotifications) return;
                setShowNotifications((prev) => !prev);
              }}
              activeOpacity={hasNotifications ? 0.7 : 1}
            >
              <MaterialCommunityIcons name="bell-outline" size={18} color="#3a4c7a" />
              {hasNotifications ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={clearSession}>
              <MaterialCommunityIcons name="logout-variant" size={18} color="#3a4c7a" />
            </TouchableOpacity>
          </View>
          {showNotifications && hasNotifications ? (
            <View style={styles.notificationMenu}>
              {notifications.map((item) => (
                <View key={item.id} style={styles.notificationMenuRow}>
                  <View
                    style={[
                      styles.notificationDot,
                      item.tone === "error"
                        ? styles.notificationDotError
                        : item.tone === "warning"
                        ? styles.notificationDotWarning
                        : styles.notificationDotInfo,
                    ]}
                  />
                  <View style={styles.notificationBody}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
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
    position: "relative",
    zIndex: 2,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
    alignItems: Platform.OS === "ios" ? "center" : "flex-start",
  },
  title: {
    color: "#1f2a44",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
    textAlign: Platform.OS === "ios" ? "center" : "left",
  },
  subtitle: {
    color: "#6b7aa6",
    fontSize: 12,
    marginTop: 4,
    textAlign: Platform.OS === "ios" ? "center" : "left",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  notificationBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef233c",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    position: "absolute",
    top: -6,
    right: -6,
  },
  notificationBadgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
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
  notificationMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    width: 260,
    maxWidth: 260,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    shadowColor: "#1b2a4e",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    zIndex: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  notificationMenuRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  notificationDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  notificationDotError: { backgroundColor: "#ef233c" },
  notificationDotWarning: { backgroundColor: "#f4b400" },
  notificationDotInfo: { backgroundColor: "#3a86ff" },
  notificationBody: { flex: 1 },
  notificationTitle: { color: "#1f2a44", fontSize: 13, fontWeight: "700" },
  notificationDescription: { color: "#6b7aa6", fontSize: 12, marginTop: 4 },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  infoLabel: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
  infoValue: { color: "#1f2a44", fontSize: 12, fontWeight: "600" },
});
