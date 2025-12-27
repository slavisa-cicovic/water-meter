import { useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { AccountsService } from "@src/services/accounts";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import AuthScreenLayout from "@src/screens/auth/components/layout/auth-screen-layout";
import SubmitButton from "@src/components/ui/submit-button";
import LinkButton from "@src/components/ui/link-button";

const initialForm = {
  firstName: "",
  lastName: "",
  address: "",
  householdSize: "1",
  identifier: "",
  phone: "",
  password: "",
};

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const refs = {
    firstName: useRef<TextInput | null>(null),
    lastName: useRef<TextInput | null>(null),
    address: useRef<TextInput | null>(null),
    householdSize: useRef<TextInput | null>(null),
    identifier: useRef<TextInput | null>(null),
    phone: useRef<TextInput | null>(null),
    password: useRef<TextInput | null>(null),
  };

  const formErrors = useMemo(() => validateForm(form), [form]);

  const onSubmit = async () => {
    if (Object.keys(formErrors).length > 0) {
      Alert.alert("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { identifier, householdSize, ...rest } = form;
    const result = await AccountsService.registerConsumer({
      ...rest,
      email: identifier,
      householdSize: Number(householdSize),
    });

    setLoading(false);
    if (result.success) {
      setMessage("Registered. Await verification to submit readings.");
      return;
    }
    setMessage(result.message);
  };

  return (
    <AuthScreenLayout paddingBottom={140}>
      <AuthHeader title="Create Account" subtitle="Fill in your details to get started." />

        <AuthField
          label="First Name"
          value={form.firstName}
          onChange={(value) => setForm({ ...form, firstName: value })}
          iconName="account-outline"
          returnKeyType="next"
          inputRef={refs.firstName}
          onSubmitEditing={() => refs.lastName.current?.focus()}
          error={formErrors.firstName}
        />
        <AuthField
          label="Last Name"
          value={form.lastName}
          onChange={(value) => setForm({ ...form, lastName: value })}
          iconName="account-outline"
          returnKeyType="next"
          inputRef={refs.lastName}
          onSubmitEditing={() => refs.address.current?.focus()}
          error={formErrors.lastName}
        />
        <AuthField
          label="Address"
          value={form.address}
          onChange={(value) => setForm({ ...form, address: value })}
          iconName="home-outline"
          returnKeyType="next"
          inputRef={refs.address}
          onSubmitEditing={() => refs.householdSize.current?.focus()}
          error={formErrors.address}
        />
        <AuthField
          label="Household Size"
          value={form.householdSize}
          onChange={(value) => setForm({ ...form, householdSize: value })}
          keyboardType="numeric"
          iconName="account-group-outline"
          returnKeyType="next"
          inputRef={refs.householdSize}
          onSubmitEditing={() => refs.identifier.current?.focus()}
          error={formErrors.householdSize}
        />
        <AuthField
          label="Email or Username"
          value={form.identifier}
          onChange={(value) => setForm({ ...form, identifier: value })}
          keyboardType="default"
          iconName="email-outline"
          returnKeyType="next"
          inputRef={refs.identifier}
          onSubmitEditing={() => refs.phone.current?.focus()}
          error={formErrors.identifier}
        />
        <AuthField
          label="Phone"
          value={form.phone}
          onChange={(value) => setForm({ ...form, phone: value })}
          keyboardType="phone-pad"
          iconName="phone-outline"
          returnKeyType="next"
          inputRef={refs.phone}
          onSubmitEditing={() => refs.password.current?.focus()}
          error={formErrors.phone}
        />
        <AuthField
          label="Password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
          secureTextEntry
          iconName="lock-outline"
          returnKeyType="done"
          inputRef={refs.password}
          error={formErrors.password}
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <SubmitButton label="Sign Up" loadingLabel="Submitting..." loading={loading} onPress={onSubmit} />

        <LinkButton label="Back to Login" onPress={() => router.push("/login")} />

        <Text style={styles.hint}>
          If this identifier/phone is already registered, we&apos;ll ask you to confirm instead of creating a new account.
        </Text>
    </AuthScreenLayout>
  );
}

const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());
const isPhone = (value: string) => /^[0-9+()\-\s]{6,}$/.test(value.trim());

const validateForm = (form: typeof initialForm) => {
  const errors: Record<string, string> = {};
  if (!form.firstName.trim()) errors.firstName = "Required";
  if (!form.lastName.trim()) errors.lastName = "Required";
  if (!form.address.trim()) errors.address = "Required";
  const household = Number(form.householdSize);
  if (!Number.isInteger(household) || household < 1) errors.householdSize = "Must be 1 or more";
  if (!form.identifier.trim()) errors.identifier = "Required";
  if (form.identifier.includes("@") && !isEmail(form.identifier)) errors.identifier = "Invalid email";
  if (!form.phone.trim()) errors.phone = "Required";
  if (!isPhone(form.phone)) errors.phone = "Invalid phone";
  if (!form.password || form.password.length < 8) errors.password = "Min 8 characters";
  return errors;
};

const styles = StyleSheet.create({
  message: { color: "#2f8f5b", marginTop: 8, marginBottom: 4 },
  hint: { color: "#7c8bb5", fontSize: 12, marginTop: 12, lineHeight: 16, textAlign: "center" },
});
