import { useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LoginService } from "@src/services/auth/login.service";
import ApiFeedback from "@src/components/ui/api-feedback";
import LinkButton from "@src/components/ui/link-button";
import SubmitButton from "@src/components/ui/submit-button";
import AuthScreenLayout from "@src/screens/auth/components/layout/auth-screen-layout";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import AuthHero from "@src/screens/auth/components/ui/auth-hero";

const initialForm = {
  identifier: "",
  password: "",
};

export default function LoginScreen() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const refs = {
    identifier: useRef<TextInput | null>(null),
    password: useRef<TextInput | null>(null),
  };

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
    <AuthScreenLayout paddingBottom={100}>
      <AuthHero />
      <AuthHeader title="Welcome to WMeter!" subtitle="Log in to your account" />

        <AuthField
          label="Email"
          value={form.identifier}
          onChange={(value) => setForm({ ...form, identifier: value })}
          placeholder="Enter your email"
          keyboardType="email-address"
          returnKeyType="next"
          inputRef={refs.identifier}
          onSubmitEditing={() => refs.password.current?.focus()}
          iconName="email-outline"
          error={formErrors.identifier}
        />
        <AuthField
          label="Password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
          placeholder="Enter your password"
          secureTextEntry
          returnKeyType="done"
          inputRef={refs.password}
          iconName="lock-outline"
          error={formErrors.password}
        />

        <TouchableOpacity style={styles.forgotButton} onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <ApiFeedback message={message} />

        <SubmitButton label="Log In" loadingLabel="Signing in..." loading={loading} onPress={onSubmit} />

        <LinkButton label="Don't have an account? Sign Up" onPress={() => router.push("/register")} />
    </AuthScreenLayout>
  );
}

const validateLogin = (form: typeof initialForm) => {
  const errors: Record<string, string> = {};
  if (!form.identifier.trim()) errors.identifier = "Required";
  if (!form.password || form.password.length < 8) errors.password = "Min 8 characters";
  return errors;
};

const styles = StyleSheet.create({
  forgotButton: { alignSelf: "flex-end", marginBottom: 8 },
  forgotText: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
});
