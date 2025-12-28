import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import AppBar from "@src/components/layout/app-bar";

export default function ReadingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Read meter" />
      <View style={styles.body}>
        <Text style={styles.title}>Read meter</Text>
        <Text style={styles.subtitle}>Reading flow coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  body: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { color: "#1f2a44", fontSize: 20, fontWeight: "700" },
  subtitle: { color: "#6b7aa6", fontSize: 13, marginTop: 8 },
});
