import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ForgotPasswordService } from "@src/services/auth/forgot-password.service";

const initialForm = {
  identifier: "",
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const formErrors = useMemo(() => validateForm(form), [form]);

  const onSubmit = async () => {
    if (Object.keys(formErrors).length > 0) {
      Alert.alert("Please enter your email or phone.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await ForgotPasswordService.request(form);
    setLoading(false);

    if (result.success) {
      setMessage("If the account exists, you'll receive reset instructions.");
      return;
    }

    setMessage(result.message);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroWrap}>
          <Image
            source={require("assets/login-screen.png")}
            style={styles.hero}
            resizeMode="contain"
          />
          <LinearGradient
            colors={["rgba(245, 247, 255, 0)", "rgba(245, 247, 255, 1)"]}
            style={styles.heroFade}
            pointerEvents="none"
          />
          <LinearGradient
            colors={["rgba(245, 247, 255, 1)", "rgba(245, 247, 255, 0)"]}
            style={styles.heroFadeTop}
            pointerEvents="none"
          />
          <LinearGradient
            colors={["rgba(245, 247, 255, 1)", "rgba(245, 247, 255, 0)"]}
            style={styles.heroFadeLeft}
            pointerEvents="none"
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
          <LinearGradient
            colors={["rgba(245, 247, 255, 0)", "rgba(245, 247, 255, 1)"]}
            style={styles.heroFadeRight}
            pointerEvents="none"
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </View>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email or phone to reset your password.</Text>

        <FormField
          label="Email or Phone"
          value={form.identifier}
          onChange={(value) => setForm({ identifier: value })}
          placeholder="Enter your email or phone"
          keyboardType="default"
          iconName="account-outline"
          error={formErrors.identifier}
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Sending..." : "Send Reset Link"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/login")}> 
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  error?: string;
};

const FormField = ({ label, value, onChange, placeholder, keyboardType, iconName, error }: FormFieldProps) => (
  <View style={styles.field}>
    <View style={[styles.inputRow, error ? styles.inputError : null]}>
      {iconName ? <MaterialCommunityIcons name={iconName} size={18} color="#6b7aa6" /> : null}
      <View style={styles.inputBody}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#a8b3d1"
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const validateForm = (form: typeof initialForm) => {
  const errors: Record<string, string> = {};
  if (!form.identifier.trim()) errors.identifier = "Required";
  return errors;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 24, paddingBottom: 40, alignItems: "center" },
  heroWrap: { width: "100%", height: 200, marginTop: 56, marginBottom: 8 },
  hero: { width: "100%", height: "100%" },
  heroFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  heroFadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 70,
  },
  heroFadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  heroFadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  title: { color: "#415a9c", fontSize: 26, fontWeight: "700", marginTop: 8 },
  subtitle: { color: "#7c8bb5", fontSize: 14, marginBottom: 24, textAlign: "center" },
  field: { width: "100%", marginBottom: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    shadowColor: "#1b2a4e",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputBody: { flex: 1 },
  label: { color: "#5a6b95", fontSize: 12, fontWeight: "600" },
  input: {
    paddingVertical: 4,
    color: "#2b3a67",
    fontSize: 15,
  },
  inputError: { borderColor: "#ef233c" },
  errorText: { color: "#ef233c", fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: "#3b6fb6",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#3b6fb6",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  message: { color: "#2f8f5b", marginTop: 8, marginBottom: 4, textAlign: "center" },
  backButton: { marginTop: 12 },
  backText: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
});
