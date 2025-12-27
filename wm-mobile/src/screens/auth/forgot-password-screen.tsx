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
import { ForgotPasswordService } from "@src/services/auth/forgot-password.service";
import AuthHero from "@src/screens/auth/components/ui/auth-hero";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import SubmitButton from "@src/components/ui/submit-button";
import LinkButton from "@src/components/ui/link-button";

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
        <AuthHero />
        <AuthHeader
          title="Forgot Password"
          subtitle="Enter your email or phone to reset your password."
        />

        <AuthField
          label="Email or Phone"
          value={form.identifier}
          onChange={(value) => setForm({ identifier: value })}
          placeholder="Enter your email or phone"
          keyboardType="default"
          iconName="account-outline"
          error={formErrors.identifier}
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <SubmitButton
          label="Send Reset Link"
          loadingLabel="Sending..."
          loading={loading}
          onPress={onSubmit}
        />

        <LinkButton label="Back to Login" onPress={() => router.push("/login")} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const validateForm = (form: typeof initialForm) => {
  const errors: Record<string, string> = {};
  if (!form.identifier.trim()) errors.identifier = "Required";
  return errors;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 24, paddingBottom: 40, alignItems: "center" },
  message: { color: "#2f8f5b", marginTop: 8, marginBottom: 4, textAlign: "center" },
});
