import { StyleSheet, Text, View } from "react-native";

export default function PaymentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoice payment</Text>
      <Text style={styles.subtitle}>Payment flow coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7ff" },
  title: { color: "#1f2a44", fontSize: 20, fontWeight: "700" },
  subtitle: { color: "#6b7aa6", fontSize: 13, marginTop: 8 },
});
