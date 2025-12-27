import { useMemo, useRef, useState } from "react";
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
import { AccountsService } from "@src/services/accounts";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";

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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthHeader title="Create Account" subtitle="Fill in your details to get started." />

        <FormField
          label="First Name"
          value={form.firstName}
          onChange={(value) => setForm({ ...form, firstName: value })}
          iconName="account-outline"
          returnKeyType="next"
          inputRef={refs.firstName}
          onSubmitEditing={() => refs.lastName.current?.focus()}
          error={formErrors.firstName}
        />
        <FormField
          label="Last Name"
          value={form.lastName}
          onChange={(value) => setForm({ ...form, lastName: value })}
          iconName="account-outline"
          returnKeyType="next"
          inputRef={refs.lastName}
          onSubmitEditing={() => refs.address.current?.focus()}
          error={formErrors.lastName}
        />
        <FormField
          label="Address"
          value={form.address}
          onChange={(value) => setForm({ ...form, address: value })}
          iconName="home-outline"
          returnKeyType="next"
          inputRef={refs.address}
          onSubmitEditing={() => refs.householdSize.current?.focus()}
          error={formErrors.address}
        />
        <FormField
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
        <FormField
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
        <FormField
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
        <FormField
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

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Submitting..." : "Sign Up"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/login")}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          If this identifier/phone is already registered, we&apos;ll ask you to confirm instead of creating a new account.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  secureTextEntry?: boolean;
  returnKeyType?: "next" | "done";
  inputRef?: React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  error?: string;
};

const FormField = ({
  label,
  value,
  onChange,
  iconName,
  keyboardType,
  secureTextEntry,
  returnKeyType,
  inputRef,
  onSubmitEditing,
  error,
}: FormFieldProps) => (
  <View style={styles.field}>
    <View style={[styles.inputRow, error ? styles.inputError : null]}>
      {iconName ? <MaterialCommunityIcons name={iconName} size={18} color="#6b7aa6" /> : null}
      <View style={styles.inputBody}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize="none"
        />
      </View>
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

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
  backButton: { marginTop: 12 },
  backText: { color: "#6b7aa6", fontSize: 12, fontWeight: "600" },
  hint: { color: "#7c8bb5", fontSize: 12, marginTop: 12, lineHeight: 16, textAlign: "center" },
});
