import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "@src/state/auth-store";
import { useNotificationsStore } from "@src/state/notifications-store";
import { MobileService } from "@src/services/mobile.service";
import {
  MobileAccountData,
  MobileBillingData,
  MobileConsumptionData,
  MobileStaffMeter,
} from "@src/api/types/mobile";
import ConsumptionSection from "@src/screens/home/components/ui/consumption-section";
import BillingSection from "@src/screens/home/components/ui/billing-section";
import StaffMetersSection from "@src/screens/home/components/ui/staff-meters-section";
import ScrollScreen from "@src/components/layout/scroll-screen";
import { useRouter } from "expo-router";
import { useTranslation } from "@src/hooks/use-translation";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const refreshNotifications = useNotificationsStore((state) => state.refreshNotifications);
  const [meterInfo, setMeterInfo] = useState<MobileAccountData["meter"] | null>(null);
  const [consumption, setConsumption] = useState<MobileConsumptionData | null>(null);
  const [consumptionTab, setConsumptionTab] = useState<"chart" | "table">("chart");
  const [billing, setBilling] = useState<MobileBillingData | null>(null);
  const [billingTab, setBillingTab] = useState<"chart" | "table">("chart");
  const [refreshingConsumption, setRefreshingConsumption] = useState(false);
  const [refreshingBilling, setRefreshingBilling] = useState(false);
  const [staffMeters, setStaffMeters] = useState<MobileStaffMeter[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : t("home.fallback.operator");
  const isConsumer = user?.role === "consumer";
  const isStaffField = user?.role === "staff_field";
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [billingYear, setBillingYear] = useState(currentYear);
  const minYear = currentYear - 10;
  const loadAccount = useCallback(async () => {
    const result = await MobileService.getAccount();
    if (result.success) {
      setMeterInfo(result.data.meter);
    }
  }, []);

  const loadConsumption = useCallback(
    async (setLoading?: (value: boolean) => void) => {
      if (!isConsumer) return;
      setLoading?.(true);
      const result = await MobileService.getConsumption(selectedYear);
      if (result.success) {
        setConsumption(result.data);
      }
      setLoading?.(false);
    },
    [isConsumer, selectedYear]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!active) return;
      await loadConsumption();
    };
    load();
    return () => {
      active = false;
    };
  }, [loadConsumption]);

  const loadBilling = useCallback(
    async (setLoading?: (value: boolean) => void) => {
      if (!isConsumer) return;
      setLoading?.(true);
      const result = await MobileService.getBilling(billingYear);
      if (result.success) {
        setBilling(result.data);
      }
      setLoading?.(false);
    },
    [billingYear, isConsumer]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!active) return;
      await loadBilling();
    };
    load();
    return () => {
      active = false;
    };
  }, [loadBilling]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!active) return;
      await loadAccount();
    };
    load();
    return () => {
      active = false;
    };
  }, [loadAccount]);

  const loadStaffMeters = useCallback(async (setLoading?: (value: boolean) => void) => {
    if (!isStaffField) return;
    setLoading?.(true);
    setStaffLoading(true);
    const result = await MobileService.getStaffMeters();
    if (result.success) {
      setStaffMeters(result.data.meters);
      setStaffError(null);
    } else {
      setStaffError(result.message);
    }
    setStaffLoading(false);
    setLoading?.(false);
  }, [isStaffField]);

  useFocusEffect(
    useCallback(() => {
      loadAccount();
      loadConsumption();
      loadBilling();
      refreshNotifications();
      loadStaffMeters();
    }, [loadAccount, loadBilling, loadConsumption, loadStaffMeters, refreshNotifications])
  );

  const formatShared = (value?: boolean) => {
    if (value === true) return t("home.shared.yes");
    if (value === false) return t("home.shared.no");
    return "-";
  };

  return (
    <ScrollScreen title={t("home.title")} contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("home.section.account")}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("home.label.name")}</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("home.label.email")}</Text>
              <Text style={styles.infoValue}>{user?.email ?? "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("home.label.address")}</Text>
              <Text style={styles.infoValue}>{user?.address ?? "-"}</Text>
            </View>
          </View>
        </View>

        {isConsumer ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("home.section.meter")}</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("home.label.serialNumber")}</Text>
                <Text style={styles.infoValue}>{meterInfo?.serialNumber ?? "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("home.label.shared")}</Text>
                <Text style={styles.infoValue}>{formatShared(meterInfo?.shared)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("home.label.status")}</Text>
                <Text style={styles.infoValue}>{meterInfo?.status ?? "-"}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {isConsumer ? (
          <ConsumptionSection
            data={consumption}
            tab={consumptionTab}
            selectedYear={selectedYear}
            minYear={minYear}
            maxYear={currentYear}
            refreshing={refreshingConsumption}
            onTabChange={setConsumptionTab}
            onYearChange={setSelectedYear}
            onRefresh={() => loadConsumption(setRefreshingConsumption)}
          />
        ) : null}

        {isConsumer ? (
          <BillingSection
            data={billing}
            tab={billingTab}
            selectedYear={billingYear}
            minYear={minYear}
            maxYear={currentYear}
            currency={billing?.currency}
            refreshing={refreshingBilling}
            onTabChange={setBillingTab}
            onYearChange={setBillingYear}
            onRefresh={() => loadBilling(setRefreshingBilling)}
          />
        ) : null}

        {isStaffField ? (
          <StaffMetersSection
            meters={staffMeters}
            loading={staffLoading}
            error={staffError}
            onRefresh={() => loadStaffMeters()}
            onSelectMeter={(meterId) => {
              router.push({ pathname: "/readings", params: { meterId } });
            }}
          />
        ) : null}

    </ScrollScreen>
  );
}


const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  section: { marginBottom: 22 },
  sectionTitle: { color: "#2b3a67", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  emptyText: { color: "#6b7aa6", fontSize: 12, marginTop: 8 },
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
