import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0b132b",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#edf2f4",
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    color: "#3a86ff",
    fontWeight: "600",
  },
});
