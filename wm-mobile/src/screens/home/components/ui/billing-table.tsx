import { StyleSheet, Text, View } from "react-native";
import { MobileBillingData } from "@src/api/types/mobile";
import { monthLabels, TABLE_HEADER_HEIGHT, TABLE_ROW_HEIGHT } from "@src/screens/home/utils/layout";

type BillingTableProps = {
  rows: MobileBillingData["rows"];
};

export default function BillingTable({ rows }: BillingTableProps) {
  return (
    <View>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.tableCellMonth, styles.tableHeaderText]}>Mo</Text>
        <Text style={[styles.tableCell, styles.tableCellAmount, styles.tableHeaderText]}>Amt</Text>
        <Text style={[styles.tableCell, styles.tableCellStatus, styles.tableHeaderText]}>
          Status
        </Text>
      </View>
      {rows.map((row) => (
        <View key={row.month} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableCellMonth]}>{monthLabels[row.month - 1]}</Text>
          <Text style={[styles.tableCell, styles.tableCellAmount]}>
            {row.status ? row.amount : "-"}
          </Text>
          <Text style={[styles.tableCell, styles.tableCellStatus]}>{row.status ?? "-"}</Text>
        </View>
      ))}
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
  tableCellMonth: { flex: 0, width: 60 },
  tableCellAmount: { flex: 0, width: 120, textAlign: "right" },
  tableCellStatus: { textAlign: "center" },
});
