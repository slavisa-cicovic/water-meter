import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@src/state/auth-store";

type AppBarProps = {
  title: string;
};

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

export default function AppBar({ title }: AppBarProps) {
  const clearSession = useAuthStore((state) => state.clearSession);
  const [showNotifications, setShowNotifications] = useState(false);
  const hasNotifications = notifications.length > 0;

  return (
    <View style={styles.wrapper}>
      {showNotifications && hasNotifications ? (
        <Modal transparent animationType="fade" visible onRequestClose={() => setShowNotifications(false)}>
          <View style={styles.modalContainer}>
            <Pressable style={styles.modalOverlay} onPress={() => setShowNotifications(false)} />
            <View style={styles.menu}>
              {notifications.map((item) => (
                <View key={item.id} style={styles.menuRow}>
                  <View
                    style={[
                      styles.dot,
                      item.tone === "error"
                        ? styles.dotError
                        : item.tone === "warning"
                        ? styles.dotWarning
                        : styles.dotInfo,
                    ]}
                  />
                  <View style={styles.menuBody}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Modal>
      ) : null}
      <View style={styles.bar}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Water Meter</Text>
          <Text style={styles.headerSubtitle}>{title}</Text>
        </View>
        <View style={styles.actions}>
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
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={clearSession}>
            <MaterialCommunityIcons name="logout-variant" size={18} color="#3a4c7a" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  modalContainer: { flex: 1 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    position: "relative",
    zIndex: 2,
  },
  headerContent: { flex: 1, alignItems: "center" },
  headerTitle: { color: "#1f2a44", fontSize: 20, fontWeight: "700" },
  headerSubtitle: { color: "#6b7aa6", fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },
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
  badge: {
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
  badgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  menu: {
    position: "absolute",
    top: 56,
    right: 16,
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
  menuRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  dotError: { backgroundColor: "#ef233c" },
  dotWarning: { backgroundColor: "#f4b400" },
  dotInfo: { backgroundColor: "#3a86ff" },
  menuBody: { flex: 1 },
  menuTitle: { color: "#1f2a44", fontSize: 13, fontWeight: "700" },
  menuDescription: { color: "#6b7aa6", fontSize: 12, marginTop: 4 },
});
