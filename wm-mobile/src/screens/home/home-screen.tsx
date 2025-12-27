import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "@src/state/auth-store";

export default function HomeScreen() {
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home view</Text>
      <TouchableOpacity style={styles.button} onPress={clearSession}>
        <Text style={styles.buttonText}>Logout (debug)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0b132b" },
  title: { color: "#edf2f4", fontSize: 20, fontWeight: "600", marginBottom: 12 },
  button: {
    backgroundColor: "#3a86ff",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
