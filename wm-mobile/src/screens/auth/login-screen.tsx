import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { LoginService } from "@src/services/auth/login.service";
import AuthHero from "@src/screens/auth/components/ui/auth-hero";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import SubmitButton from "@src/components/ui/submit-button";
import LinkButton from "@src/components/ui/link-button";

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

        <AuthField
          label="Email"
          value={form.identifier}
          onChange={(value) => setForm({ ...form, identifier: value })}
          placeholder="Enter your email"
          keyboardType="email-address"
          iconName="email-outline"
          error={formErrors.identifier}
        />
        <AuthField
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

        <SubmitButton label="Log In" loadingLabel="Signing in..." loading={loading} onPress={onSubmit} />

        <LinkButton label="Don't have an account? Sign Up" onPress={() => router.push("/register")} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const validateLogin = (form: typeof initialForm) => {
  const errors: Record<string, string> = {};
  if (!form.identifier.trim()) errors.identifier = "Required";
  if (!form.password || form.password.length < 8) errors.password = "Min 8 characters";
  return errors;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 24, paddingBottom: 40, alignItems: "center" },
  forgotButton: { alignSelf: "flex-end", marginBottom: 8 },
  forgotText: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
  message: { color: "#2f8f5b", marginTop: 8, marginBottom: 4 },
});
