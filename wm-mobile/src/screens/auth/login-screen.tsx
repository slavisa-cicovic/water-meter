import { useMemo, useState } from "react";
import {
  Alert,
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
import { useRouter } from "expo-router";
import { LoginService } from "@src/services/auth/login.service";
import AuthHero from "@src/screens/auth/components/ui/auth-hero";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";

const initialForm = {
  identifier: "",
  password: "",
};

export default function LoginScreen() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const formErrors = useMemo(() => validateLogin(form), [form]);

  const onSubmit = async () => {
    if (Object.keys(formErrors).length > 0) {
      Alert.alert("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await LoginService.login(form);
    setLoading(false);

    if (result.success) {
      setMessage("Logged in successfully.");
      return;
    }

    setMessage(result.message);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthHero />
        <AuthHeader title="Welcome to WMeter!" subtitle="Log in to your account" />

        <FormField
          label="Email"
          value={form.identifier}
          onChange={(value) => setForm({ ...form, identifier: value })}
          placeholder="Enter your email"
          keyboardType="email-address"
          iconName="email-outline"
          error={formErrors.identifier}
        />
        <FormField
          label="Password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
          placeholder="Enter your password"
          secureTextEntry
          iconName="lock-outline"
          error={formErrors.password}
        />

        <TouchableOpacity style={styles.forgotButton} onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Signing in..." : "Log In"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={() => router.push("/register")}>
          <Text style={styles.signupText}>Don&apos;t have an account? Sign Up</Text>
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
  secureTextEntry?: boolean;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  error?: string;
};

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  secureTextEntry,
  iconName,
  error,
}: FormFieldProps) => (
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
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
      </View>
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const validateLogin = (form: typeof initialForm) => {
  const errors: Record<string, string> = {};
  if (!form.identifier.trim()) errors.identifier = "Required";
  if (!form.password || form.password.length < 8) errors.password = "Min 8 characters";
  return errors;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 24, paddingBottom: 40, alignItems: "center" },
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
  forgotButton: { alignSelf: "flex-end", marginBottom: 8 },
  forgotText: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
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
  message: { color: "#2f8f5b", marginTop: 8, marginBottom: 4 },
  signupButton: { marginTop: 14 },
  signupText: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
});
