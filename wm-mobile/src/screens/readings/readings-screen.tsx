import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ViewShot from "react-native-view-shot";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ScrollScreen from "@src/components/layout/scroll-screen";
import SubmitButton from "@src/components/ui/submit-button";
import { MobileService } from "@src/services/mobile.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@src/state/auth-store";
import { MobileReadingContext } from "@src/api/types/mobile";
import { useMeterOcr } from "@src/hooks/use-meter-ocr";
import { useMeterBarcode } from "@src/hooks/use-meter-barcode";

export default function ReadingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user = useAuthStore((state) => state.user);
  const [context, setContext] = useState<MobileReadingContext | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [imageFilename, setImageFilename] = useState<string | null>(null);
  const [recognizedValue, setRecognizedValue] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [watermarkLabel, setWatermarkLabel] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [imageLayout, setImageLayout] = useState<{ width: number; height: number } | null>(null);
  const [showCandidatePicker, setShowCandidatePicker] = useState(false);
  const [availableMeters, setAvailableMeters] = useState<
    NonNullable<MobileReadingContext["meters"]>
  >([]);
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const viewShotRef = useRef<ViewShot | null>(null);
  const scale = useSharedValue(1);
  const lastScale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const formatReadingValue = (value: number) => value.toFixed(2);
  const previousMeterIdRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (previousMeterIdRef.current !== routeMeterId) {
      resetReadingInput();
      setSelectedMeterId(routeMeterId ?? null);
      previousMeterIdRef.current = routeMeterId;
    }
  }, [routeMeterId]);

  const previousPaidValue = context?.previousPaidValue ?? 0;
  const meter = context?.meter ?? null;
  const isStaffField = user?.role === "staff_field";
  const {
    recognize,
    recognizing,
    boxes: ocrBoxes,
    candidates: ocrCandidates,
  } = useMeterOcr(previousPaidValue);
  const { scan, scanning: scanningBarcode, barcodes } = useMeterBarcode();
  const sortedCandidates = [...ocrCandidates].sort((a, b) => {
    const aValid = a.value !== null;
    const bValid = b.value !== null;
    if (aValid !== bValid) return aValid ? -1 : 1;
    if (a.value !== null && b.value !== null) return b.value - a.value;
    return a.text.localeCompare(b.text);
  });
  const sortedBarcodes = [...barcodes].sort((a, b) => a.localeCompare(b));

  const resetReadingInput = () => {
    setSourceUri(null);
    setPhotoUri(null);
    setImageFilename(null);
    setRecognizedValue(null);
    setInputValue("");
    setWatermarkLabel("");
    setShowPreview(false);
    setSelectedBoxId(null);
    setImageSize(null);
    setShowCandidatePicker(false);
  };

  const closePreview = () => {
    setShowPreview(false);
    lastScale.value = 1;
    scale.value = 1;
  };

  const handleSelectMeter = (meterId: string) => {
    setSelectedMeterId(meterId);
    resetReadingInput();
    loadContext(meterId).catch(() => null);
  };

  const runRecognition = async (uri: string) => {
    try {
      const result = await recognize(uri, imageSize ?? undefined);
      const barcodeResult = await scan(uri);
      const hasCandidates = result.candidates.length > 0;
      const hasBarcodes = barcodeResult.length > 0;

      if (result.best) {
        setSelectedBoxId(result.best.id);
        setRecognizedValue(result.best.value);
        setInputValue(formatReadingValue(result.best.value));
        setShowCandidatePicker(false);
        return;
      }

      if (!hasCandidates && !hasBarcodes) {
        setRecognizedValue(null);
        setInputValue("");
        setSelectedBoxId(null);
        Alert.alert("OCR failed", "Unable to recognize the meter value. Please enter it manually.");
        return;
      }

      setRecognizedValue(null);
      setInputValue("");
      setSelectedBoxId(null);
      setShowCandidatePicker(true);
    } catch {
      setRecognizedValue(null);
      setInputValue("");
      setSelectedBoxId(null);
      setShowCandidatePicker(false);
      Alert.alert("OCR failed", "Unable to process the photo. Please enter the value manually.");
    }
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
    const timestamp = new Date().toLocaleString();
    const sender = user ? `${user.firstName} ${user.lastName}`.trim() : "Unknown user";

    setSourceUri(asset.uri);
    setShowCandidatePicker(false);
    Image.getSize(
      asset.uri,
      (width, height) => setImageSize({ width, height }),
      () => setImageSize(null)
    );
    setImageFilename(filename);
    setWatermarkLabel(`${timestamp} • ${sender}`);
    runRecognition(asset.uri);
  };

  const handlePickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Gallery access", "Photo library permission is required to pick a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const filename = asset.fileName ?? asset.uri.split("/").pop() ?? "meter-photo.jpg";
    const timestamp = new Date().toLocaleString();
    const sender = user ? `${user.firstName} ${user.lastName}`.trim() : "Unknown user";

    setSourceUri(asset.uri);
    setShowCandidatePicker(false);
    Image.getSize(
      asset.uri,
      (width, height) => setImageSize({ width, height }),
      () => setImageSize(null)
    );
    setImageFilename(filename);
    setWatermarkLabel(`${timestamp} • ${sender}`);
    runRecognition(asset.uri);
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

    const normalizedInput = inputValue.replace(",", ".");
    const parsed = Number.parseFloat(normalizedInput);
    const normalizedValue = Math.round(parsed * 100) / 100;
    if (!Number.isFinite(normalizedValue) || normalizedValue < 0) {
      Alert.alert("Invalid value", "Please enter a valid meter reading (e.g. 00000.00).");
      return;
    }

    const method: "photo_ocr" | "manual" = sourceUri ? "photo_ocr" : "manual";
    const originalValue = recognizedValue ?? normalizedValue;
    let capturedUri = photoUri;
    let payloadFilename = imageFilename ?? "meter-photo.jpg";
    if (sourceUri && viewShotRef.current?.capture) {
      try {
        capturedUri = await viewShotRef.current.capture();
        const capturedName = capturedUri.split("/").pop();
        if (capturedName) {
          setImageFilename(capturedName);
          payloadFilename = capturedName;
        }
        setPhotoUri(capturedUri);
      } catch {
        capturedUri = sourceUri;
      }
    }

    const payload = {
      meterId: meter.id,
      accountId: user.id,
      method,
      value: normalizedValue,
      originalValue,
      imageFilename: sourceUri ? payloadFilename : null,
      barcode: sortedBarcodes[0] ?? null,
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
      <Modal transparent animationType="fade" visible={showPreview} onRequestClose={closePreview}>
        <GestureHandlerRootView style={styles.previewBackdrop}>
          <TouchableOpacity style={styles.previewClose} onPress={closePreview}>
            <Text style={styles.previewCloseText}>Close</Text>
          </TouchableOpacity>
          {sourceUri ? (
            <GestureDetector
              gesture={Gesture.Pinch()
                .onStart(() => {
                  lastScale.value = scale.value;
                })
                .onUpdate((event) => {
                  const nextScale = lastScale.value * event.scale;
                  scale.value = Math.max(1, Math.min(4, nextScale));
                })
                .onEnd(() => {
                  if (scale.value < 1) {
                    scale.value = withTiming(1);
                  }
                })}
            >
              <Animated.View style={[styles.previewImageContainer, animatedStyle]}>
                <Image source={{ uri: sourceUri }} style={styles.previewImage} />
              </Animated.View>
            </GestureDetector>
          ) : null}
        </GestureHandlerRootView>
      </Modal>
      <Modal
        transparent
        animationType="fade"
        visible={showCandidatePicker}
        onRequestClose={() => setShowCandidatePicker(false)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select detected text</Text>
            <Text style={styles.pickerSubtitle}>
              Review OCR results and barcode scan output.
            </Text>
            <ScrollView style={styles.pickerList} contentContainerStyle={styles.pickerListContent}>
              {sortedBarcodes.length > 0 ? (
                <View style={styles.pickerSection}>
                  <Text style={styles.pickerSectionTitle}>Barcode</Text>
                  {sortedBarcodes.map((code, index) => (
                    <View key={`${code}-${index}`} style={styles.pickerItem}>
                      <Text style={styles.pickerItemText}>{code}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {sortedCandidates.length === 0 && sortedBarcodes.length === 0 ? (
                <Text style={styles.helperText}>No OCR candidates or barcodes found.</Text>
              ) : (
                <View style={styles.pickerSection}>
                  <Text style={styles.pickerSectionTitle}>OCR candidates</Text>
                  {sortedCandidates.map((candidate) => (
                    <TouchableOpacity
                      key={candidate.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        if (candidate.value === null) {
                          Alert.alert("Invalid selection", "This text does not match the meter format.");
                          return;
                        }
                        setRecognizedValue(candidate.value);
                        setInputValue(formatReadingValue(candidate.value));
                        setShowCandidatePicker(false);
                      }}
                    >
                      <Text style={styles.pickerItemText}>{candidate.text}</Text>
                      {candidate.value !== null ? (
                        <Text style={styles.pickerItemValue}>{formatReadingValue(candidate.value)}</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.pickerClose} onPress={() => setShowCandidatePicker(false)}>
              <Text style={styles.pickerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
          <View style={styles.meterMeta}>
            <Text style={styles.meterMetaText}>
              Meter: {meter?.serialNumber ?? "Not linked"}
            </Text>
            <Text style={styles.meterMetaText}>
              Barcode: {sortedBarcodes[0] ?? "Not detected"}
            </Text>
          </View>
          <Text style={styles.label}>Previous paid reading</Text>
          <Text style={styles.value}>{previousPaidValue}</Text>
          {contextError ? <Text style={styles.errorText}>{contextError}</Text> : null}
          {loadingContext ? <Text style={styles.helperText}>Loading reading data...</Text> : null}

          <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
            <Text style={styles.cameraButtonText}>Open camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryButton} onPress={handlePickFromGallery}>
            <Text style={styles.galleryButtonText}>Choose from gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imageCard}
            activeOpacity={sourceUri ? 0.8 : 1}
            onPress={() => {
              if (sourceUri) {
                lastScale.value = 1;
                scale.value = 1;
                setShowPreview(true);
              }
            }}
          >
            {sourceUri ? (
              <View
                style={styles.imageWrapper}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setImageLayout({ width, height });
                }}
              >
                <ViewShot ref={viewShotRef} style={styles.imageShot}>
                  <Image source={{ uri: sourceUri }} style={styles.image} />
                  <View style={styles.watermark}>
                    <Text style={styles.watermarkText}>{watermarkLabel}</Text>
                  </View>
                </ViewShot>
                {imageSize && imageLayout && ocrBoxes.length ? (
                  <View style={styles.boxOverlay}>
                    {ocrBoxes.map((box) => {
                      const scaleFactor = Math.min(
                        imageLayout.width / imageSize.width,
                        imageLayout.height / imageSize.height
                      );
                      const displayWidth = imageSize.width * scaleFactor;
                      const displayHeight = imageSize.height * scaleFactor;
                      const offsetX = (imageLayout.width - displayWidth) / 2;
                      const offsetY = (imageLayout.height - displayHeight) / 2;
                      const left = box.frame.left * scaleFactor + offsetX;
                      const top = box.frame.top * scaleFactor + offsetY;
                      const width = box.frame.width * scaleFactor;
                      const height = box.frame.height * scaleFactor;
                      const isSelected = box.id === selectedBoxId;
                      return (
                        <TouchableOpacity
                          key={box.id}
                          style={[
                            styles.boxItem,
                            { left, top, width, height },
                            isSelected ? styles.boxItemSelected : null,
                          ]}
                          onPress={() => {
                            setSelectedBoxId(box.id);
                            setRecognizedValue(box.value);
                            setInputValue(formatReadingValue(box.value));
                          }}
                        />
                      );
                    })}
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={styles.placeholderText}>No photo captured yet</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Recognized value</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={recognizedValue !== null ? formatReadingValue(recognizedValue) : ""}
            editable={false}
            placeholder="Waiting for photo"
            placeholderTextColor="#a8b3d1"
          />
          {recognizing ? <Text style={styles.helperText}>Recognizing text...</Text> : null}
          {ocrCandidates.length > 0 ? (
            <Text style={styles.helperText}>Use the OCR results list to pick the correct reading.</Text>
          ) : null}
          {sourceUri ? (
            <View style={styles.ocrActions}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => runRecognition(sourceUri)}
                disabled={recognizing}
              >
                <Text style={styles.retryButtonText}>{recognizing ? "Recognizing..." : "Try OCR again"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.label}>Your value</Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter meter value (00000.00)"
            placeholderTextColor="#a8b3d1"
            keyboardType="decimal-pad"
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
  meterMeta: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f3f5fb",
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  meterMetaText: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
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
  galleryButton: {
    backgroundColor: "#e9edfb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  galleryButtonText: { color: "#3a4c7a", fontSize: 13, fontWeight: "600" },
  retryButton: {
    backgroundColor: "#eef1fb",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 10,
  },
  retryButtonText: { color: "#3a4c7a", fontSize: 12, fontWeight: "600" },
  ocrActions: {
    marginTop: 10,
    gap: 8,
  },
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
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  previewClose: {
    position: "absolute",
    top: 24,
    right: 20,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 2,
  },
  previewCloseText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },
  previewImageContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imageShot: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  imageWrapper: { width: "100%", height: "100%", position: "relative" },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
  boxOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  boxItem: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(58, 76, 122, 0.6)",
    backgroundColor: "rgba(58, 76, 122, 0.08)",
    borderRadius: 6,
  },
  boxItemSelected: {
    borderColor: "#2a5bff",
    backgroundColor: "rgba(42, 91, 255, 0.18)",
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 24,
  },
  pickerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  pickerTitle: { color: "#1f2a44", fontSize: 16, fontWeight: "700" },
  pickerSubtitle: { color: "#6b7aa6", fontSize: 12, marginTop: 4 },
  pickerList: { marginTop: 12, maxHeight: 260 },
  pickerListContent: { paddingBottom: 4 },
  pickerSection: { marginBottom: 12 },
  pickerSectionTitle: { color: "#1f2a44", fontSize: 12, fontWeight: "700", marginBottom: 6 },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    marginBottom: 8,
    backgroundColor: "#f8f9ff",
  },
  pickerItemText: { color: "#1f2a44", fontSize: 12 },
  pickerItemValue: { color: "#3a4c7a", fontSize: 12, fontWeight: "600", marginTop: 4 },
  pickerClose: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pickerCloseText: { color: "#3a4c7a", fontSize: 12, fontWeight: "600" },
  watermark: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  watermarkText: { color: "#ffffff", fontSize: 10, fontWeight: "600", textAlign: "center" },
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
