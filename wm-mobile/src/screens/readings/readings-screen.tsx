import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ScrollScreen from "@src/components/layout/scroll-screen";
import SubmitButton from "@src/components/ui/submit-button";
import { MobileService } from "@src/services/mobile.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@src/state/auth-store";
import { MobileReadingContext } from "@src/api/types/mobile";

export default function ReadingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user = useAuthStore((state) => state.user);
  const [context, setContext] = useState<MobileReadingContext | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [imageFilename, setImageFilename] = useState<string | null>(null);
  const [recognizedValue, setRecognizedValue] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [availableMeters, setAvailableMeters] = useState<
    NonNullable<MobileReadingContext["meters"]>
  >([]);
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const routeMeterId = typeof params.meterId === "string" ? params.meterId : null;

  const loadContext = async (meterId?: string | null) => {
    setLoadingContext(true);
    const result = await MobileService.getReadingContext(meterId ?? undefined);
    setLoadingContext(false);
    if (!result.success) {
      setContextError(result.message);
      return;
    }
    setContextError(null);
    setContext(result.data);
    setAvailableMeters(result.data.meters ?? []);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      await loadContext(routeMeterId);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [routeMeterId]);

  const previousPaidValue = context?.previousPaidValue ?? 0;
  const meter = context?.meter ?? null;
  const isStaffField = user?.role === "staff_field";

  const resetReadingInput = () => {
    setPhotoUri(null);
    setImageFilename(null);
    setRecognizedValue(null);
    setInputValue("");
  };

  const handleSelectMeter = (meterId: string) => {
    setSelectedMeterId(meterId);
    resetReadingInput();
    loadContext(meterId).catch(() => null);
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera access", "Camera permission is required to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const filename = asset.fileName ?? asset.uri.split("/").pop() ?? "meter-photo.jpg";
    const fakeValue = previousPaidValue + 10 + Math.floor(Math.random() * 11);

    setPhotoUri(asset.uri);
    setImageFilename(filename);
    setRecognizedValue(fakeValue);
    setInputValue(String(fakeValue));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Session expired", "Please log in again.");
      return;
    }
    if (!meter) {
      Alert.alert("Meter unavailable", "No meter assigned to this account.");
      return;
    }

    const parsed = Number.parseInt(inputValue, 10);
    if (!Number.isInteger(parsed) || parsed < 0) {
      Alert.alert("Invalid value", "Please enter a valid meter reading.");
      return;
    }

    const method: "photo_ocr" | "manual" = photoUri ? "photo_ocr" : "manual";
    const originalValue = recognizedValue ?? parsed;
    const payload = {
      meterId: meter.id,
      accountId: user.id,
      method,
      value: parsed,
      originalValue,
      imageFilename: photoUri ? imageFilename ?? "meter-photo.jpg" : null,
    };

    setSubmitting(true);
    const result = await MobileService.createReading(payload);
    setSubmitting(false);

    if (!result.success) {
      Alert.alert("Submit failed", result.message);
      return;
    }

    Alert.alert("Success", "Reading submitted successfully.", [
      {
        text: "OK",
        onPress: () => {
          router.replace("/home");
        },
      },
    ]);
  };

  return (
    <ScrollScreen title="Read meter" contentContainerStyle={styles.content} keyboardAvoiding>
      {isStaffField && !meter && !routeMeterId ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select meter</Text>
          {loadingContext ? <Text style={styles.helperText}>Loading meters...</Text> : null}
          {contextError ? <Text style={styles.errorText}>{contextError}</Text> : null}
          {availableMeters.length === 0 && !loadingContext ? (
            <Text style={styles.helperText}>No meters available.</Text>
          ) : null}
          {availableMeters.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.meterOption,
                selectedMeterId === item.id ? styles.meterOptionActive : null,
              ]}
              onPress={() => handleSelectMeter(item.id)}
            >
              <View style={styles.meterOptionHeader}>
                <Text style={styles.meterOptionSerial}>{item.serialNumber}</Text>
                {item.shared ? <Text style={styles.meterOptionBadge}>Shared</Text> : null}
              </View>
              <Text style={styles.meterOptionAddress}>{item.address ?? "Address not set"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Meter capture</Text>
          <Text style={styles.meterMeta}>
            {meter ? `Meter ${meter.serialNumber}` : "Meter not linked"}
          </Text>
          <Text style={styles.label}>Previous paid reading</Text>
          <Text style={styles.value}>{previousPaidValue}</Text>
          {contextError ? <Text style={styles.errorText}>{contextError}</Text> : null}
          {loadingContext ? <Text style={styles.helperText}>Loading reading data...</Text> : null}

          <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
            <Text style={styles.cameraButtonText}>Open camera</Text>
          </TouchableOpacity>

          <View style={styles.imageCard}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.image} />
            ) : (
              <Text style={styles.placeholderText}>No photo captured yet</Text>
            )}
          </View>

          <Text style={styles.label}>Recognized value</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={recognizedValue !== null ? String(recognizedValue) : ""}
            editable={false}
            placeholder="Waiting for photo"
            placeholderTextColor="#a8b3d1"
          />

          <Text style={styles.label}>Your value</Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter meter value"
            placeholderTextColor="#a8b3d1"
            keyboardType="numeric"
          />

          <SubmitButton
            label="Submit reading"
            loadingLabel="Submitting..."
            loading={submitting}
            disabled={!meter || !inputValue.trim()}
            onPress={handleSubmit}
          />
        </View>
      )}
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
  sectionTitle: { color: "#1f2a44", fontSize: 18, fontWeight: "700" },
  meterMeta: { color: "#6b7aa6", fontSize: 12, marginTop: 4 },
  label: { color: "#6b7aa6", fontSize: 12, fontWeight: "600", marginTop: 14 },
  value: { color: "#1f2a44", fontSize: 16, fontWeight: "700", marginTop: 6 },
  helperText: { color: "#6b7aa6", fontSize: 12, marginTop: 6 },
  errorText: { color: "#b23a3a", fontSize: 12, marginTop: 6 },
  cameraButton: {
    backgroundColor: "#e9edfb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  cameraButtonText: { color: "#3a4c7a", fontSize: 13, fontWeight: "600" },
  imageCard: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    backgroundColor: "#f8f9ff",
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholderText: { color: "#a8b3d1", fontSize: 12 },
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
  inputReadOnly: { backgroundColor: "#f3f5fb" },
  meterOption: {
    marginTop: 12,
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  meterOptionActive: {
    borderColor: "#3a4c7a",
    backgroundColor: "#eef1fb",
  },
  meterOptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meterOptionSerial: { color: "#1f2a44", fontSize: 14, fontWeight: "700" },
  meterOptionBadge: {
    color: "#3a4c7a",
    fontSize: 11,
    fontWeight: "600",
    backgroundColor: "#e9edfb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  meterOptionAddress: { color: "#6b7aa6", fontSize: 12, marginTop: 6 },
});
