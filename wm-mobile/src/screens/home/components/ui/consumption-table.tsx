import { StyleSheet, Text, View } from "react-native";
import { MobileConsumptionData } from "@src/api/types/mobile";
import { monthLabels, TABLE_HEADER_HEIGHT, TABLE_ROW_HEIGHT } from "@src/screens/home/utils/layout";

type ConsumptionTableProps = {
  rows: MobileConsumptionData["rows"];
};

export default function ConsumptionTable({ rows }: ConsumptionTableProps) {
  return (
    <View>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.tableCellMonth, styles.tableHeaderText]}>Mo</Text>
        <Text style={[styles.tableCell, styles.tableCellNumber, styles.tableHeaderText]}>Prev</Text>
        <Text style={[styles.tableCell, styles.tableCellNumber, styles.tableHeaderText]}>Curr</Text>
        <Text style={[styles.tableCell, styles.tableCellNumber, styles.tableHeaderText]}>Cons</Text>
      </View>
      {rows.map((row) => {
        const isNegative = row.consumption < 0;
        return (
          <View key={row.month} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellMonth]}>{monthLabels[row.month - 1]}</Text>
            <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.previous ?? "-"}</Text>
            <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.current ?? "-"}</Text>
            <Text
              style={[
                styles.tableCell,
                styles.tableCellNumber,
                isNegative ? styles.tableCellError : null,
              ]}
            >
              {Math.max(0, row.consumption)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: "row",
    marginBottom: 8,
    height: TABLE_HEADER_HEIGHT,
    alignItems: "center",
  },
  tableHeaderText: { color: "#2b3a67", fontWeight: "700" },
  tableRow: {
    flexDirection: "row",
    height: TABLE_ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#eef1fb",
    alignItems: "center",
  },
  tableCell: { flex: 1, color: "#1f2a44", fontSize: 12 },
  tableCellMonth: { flex: 0, width: 40 },
  tableCellNumber: { textAlign: "right" },
  tableCellError: { color: "#ef233c" },
});
