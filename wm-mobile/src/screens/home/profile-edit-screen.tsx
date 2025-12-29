import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@src/state/auth-store";
import { MobileService } from "@src/services/mobile.service";
import ScrollScreen from "@src/components/layout/scroll-screen";

export default function ProfileEditScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
  });

  useEffect(() => {
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    });
  }, [user?.firstName, user?.lastName, user?.email]);

  const handleSave = async () => {
    if (!user || !accessToken) {
      Alert.alert("Profile unavailable", "Please log in again.");
      return;
    }

    const trimmed = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
    };

    if (!trimmed.firstName || !trimmed.lastName || !trimmed.email) {
      Alert.alert("Missing info", "First name, last name, and email are required.");
      return;
    }

    setSaving(true);
    const result = await MobileService.updateProfile(trimmed);
    setSaving(false);

    if (!result.success) {
      Alert.alert("Update failed", result.message);
      return;
    }

    Alert.alert("Profile updated", "Changes saved.");
    router.back();
  };

  return (
    <ScrollScreen title="Profile" contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={styles.input}
            value={form.firstName}
            onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
            placeholder="Enter first name"
            placeholderTextColor="#a8b3d1"
          />
          <Text style={styles.label}>Last name</Text>
          <TextInput
            style={styles.input}
            value={form.lastName}
            onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
            placeholder="Enter last name"
            placeholderTextColor="#a8b3d1"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
            placeholder="Enter email"
            placeholderTextColor="#a8b3d1"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save changes"}</Text>
          </TouchableOpacity>
        </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  label: { color: "#6b7aa6", fontSize: 12, fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#e1e6f3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1f2a44",
    backgroundColor: "#ffffff",
    marginTop: 6,
  },
  actions: { flexDirection: "row", gap: 12, marginTop: 20 },
  primaryButton: {
    flex: 1,
    backgroundColor: "#3a4c7a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#e9edfb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#3a4c7a", fontSize: 12, fontWeight: "600" },
});
