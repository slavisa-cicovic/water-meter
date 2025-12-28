import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type YearPickerProps = {
  value: number;
  minYear: number;
  maxYear: number;
  onChange: (year: number) => void;
};

export default function YearPicker({ value, minYear, maxYear, onChange }: YearPickerProps) {
  const canDecrement = value > minYear;
  const canIncrement = value < maxYear;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canDecrement ? styles.buttonDisabled : null]}
        onPress={() => onChange(Math.max(minYear, value - 1))}
        disabled={!canDecrement}
      >
        <Text style={styles.buttonText}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity
        style={[styles.button, !canIncrement ? styles.buttonDisabled : null]}
        onPress={() => onChange(Math.min(maxYear, value + 1))}
        disabled={!canIncrement}
      >
        <Text style={styles.buttonText}>{">"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 8 },
  button: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#e9edfb",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#3a4c7a", fontSize: 12, fontWeight: "700" },
  value: { color: "#2b3a67", fontSize: 12, fontWeight: "700" },
});
