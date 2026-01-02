import { useState } from "react";
import BarcodeScanner from "@react-native-ml-kit/barcode-scanning";

export function useMeterBarcode() {
  const [scanning, setScanning] = useState(false);
  const [barcodes, setBarcodes] = useState<string[]>([]);

  const scan = async (uri: string) => {
    setScanning(true);
    setBarcodes([]);
    try {
      const result = await BarcodeScanner.scan(uri);
      const next = result
        .map((item) => item.value ?? "")
        .filter((value) => value.trim().length > 0);
      setBarcodes(next);
      return next;
    } catch {
      setBarcodes([]);
      return [];
    } finally {
      setScanning(false);
    }
  };

  return { scan, scanning, barcodes };
}
