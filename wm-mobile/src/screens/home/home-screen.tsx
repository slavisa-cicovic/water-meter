import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@src/state/auth-store";
import { useRouter } from "expo-router";
import { MobileService } from "@src/services/mobile.service";
import { MobileAccountData } from "@src/api/types/mobile";

export default function HomeScreen() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [meterInfo, setMeterInfo] = useState<MobileAccountData["meter"] | null>(null);
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Field operator";
  const isConsumer = user?.role === "consumer";

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.cardRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Readings</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pending sync</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Route</Text>
              <Text style={styles.statValue}>-</Text>
            </View>
          </View>
        </View>

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
  cardRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    shadowColor: "#1b2a4e",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statLabel: { color: "#6b7aa6", fontSize: 12 },
  statValue: { color: "#1f2a44", fontSize: 18, fontWeight: "700", marginTop: 6 },
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
