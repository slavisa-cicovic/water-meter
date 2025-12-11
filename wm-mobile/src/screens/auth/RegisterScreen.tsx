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
import { AccountsService } from "@src/services/accounts";
import { StaffRole } from "@src/api/types/accounts";

type Mode = "consumer" | "staff";

const initialConsumer = {
  firstName: "",
  lastName: "",
  address: "",
  householdSize: "1",
  email: "",
  phone: "",
  password: "",
};

const initialStaff = {
  firstName: "",
  lastName: "",
  address: "",
  email: "",
  phone: "",
  password: "",
  staffRole: "field" as StaffRole,
};

export default function RegisterScreen() {
  const [mode, setMode] = useState<Mode>("consumer");
  const [consumerForm, setConsumerForm] = useState(initialConsumer);
  const [staffForm, setStaffForm] = useState(initialStaff);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activeFormErrors = useMemo(
    () => (mode === "consumer" ? validateConsumer(consumerForm) : validateStaff(staffForm)),
    [mode, consumerForm, staffForm]
  );

  const onSubmit = async () => {
    if (Object.keys(activeFormErrors).length > 0) {
      Alert.alert("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    setMessage(null);

    if (mode === "consumer") {
      const result = await AccountsService.registerConsumer({
        ...consumerForm,
        householdSize: Number(consumerForm.householdSize),
      });
      setLoading(false);
      if (result.success) {
        setMessage("Registered. Await verification to submit readings.");
        return;
      }
      setMessage(result.message);
      return;
    }

    const result = await AccountsService.registerStaff(staffForm);
    setLoading(false);
    if (result.success) {
      setMessage("Staff registered. Await back-office verification.");
      return;
    }
    setMessage(result.message);
  };

  const renderConsumer = () => (
    <>
      <FormField
        label="First Name"
        value={consumerForm.firstName}
        onChange={(value) => setConsumerForm({ ...consumerForm, firstName: value })}
        error={activeFormErrors.firstName}
      />
      <FormField
        label="Last Name"
        value={consumerForm.lastName}
        onChange={(value) => setConsumerForm({ ...consumerForm, lastName: value })}
        error={activeFormErrors.lastName}
      />
      <FormField
        label="Address"
        value={consumerForm.address}
        onChange={(value) => setConsumerForm({ ...consumerForm, address: value })}
        error={activeFormErrors.address}
      />
      <FormField
        label="Household Size"
        value={consumerForm.householdSize}
        onChange={(value) => setConsumerForm({ ...consumerForm, householdSize: value })}
        keyboardType="numeric"
        error={activeFormErrors.householdSize}
      />
      <FormField
        label="Email"
        value={consumerForm.email}
        onChange={(value) => setConsumerForm({ ...consumerForm, email: value })}
        keyboardType="email-address"
        error={activeFormErrors.email}
      />
      <FormField
        label="Phone (optional)"
        value={consumerForm.phone}
        onChange={(value) => setConsumerForm({ ...consumerForm, phone: value })}
        keyboardType="phone-pad"
        error={activeFormErrors.phone}
      />
      <FormField
        label="Password"
        value={consumerForm.password}
        onChange={(value) => setConsumerForm({ ...consumerForm, password: value })}
        secureTextEntry
        error={activeFormErrors.password}
      />
    </>
  );

  const renderStaff = () => (
    <>
      <FormField
        label="First Name"
        value={staffForm.firstName}
        onChange={(value) => setStaffForm({ ...staffForm, firstName: value })}
        error={activeFormErrors.firstName}
      />
      <FormField
        label="Last Name"
        value={staffForm.lastName}
        onChange={(value) => setStaffForm({ ...staffForm, lastName: value })}
        error={activeFormErrors.lastName}
      />
      <FormField
        label="Address"
        value={staffForm.address}
        onChange={(value) => setStaffForm({ ...staffForm, address: value })}
        error={activeFormErrors.address}
      />
      <FormField
        label="Email"
        value={staffForm.email}
        onChange={(value) => setStaffForm({ ...staffForm, email: value })}
        keyboardType="email-address"
        error={activeFormErrors.email}
      />
      <FormField
        label="Phone (optional)"
        value={staffForm.phone}
        onChange={(value) => setStaffForm({ ...staffForm, phone: value })}
        keyboardType="phone-pad"
        error={activeFormErrors.phone}
      />
      <FormField
        label="Password"
        value={staffForm.password}
        onChange={(value) => setStaffForm({ ...staffForm, password: value })}
        secureTextEntry
        error={activeFormErrors.password}
      />
      <View style={styles.field}>
        <Text style={styles.label}>Staff Role</Text>
        <View style={styles.toggleRow}>
          <ToggleChip
            selected={staffForm.staffRole === "field"}
            label="Field"
            onPress={() => setStaffForm({ ...staffForm, staffRole: "field" })}
          />
          <ToggleChip
            selected={staffForm.staffRole === "backoffice"}
            label="Back-office"
            onPress={() => setStaffForm({ ...staffForm, staffRole: "backoffice" })}
          />
        </View>
        {activeFormErrors.staffRole ? <Text style={styles.errorText}>{activeFormErrors.staffRole}</Text> : null}
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Register</Text>

        <View style={styles.toggleRow}>
          <ToggleChip selected={mode === "consumer"} label="Consumer" onPress={() => setMode("consumer")} />
          <ToggleChip selected={mode === "staff"} label="Staff" onPress={() => setMode("staff")} />
        </View>

        {mode === "consumer" ? renderConsumer() : renderStaff()}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Submitting..." : "Submit"}</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          If this email/phone is already registered, we'll ask you to confirm instead of creating a new account.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  secureTextEntry?: boolean;
  error?: string;
};

const FormField = ({ label, value, onChange, keyboardType, secureTextEntry, error }: FormFieldProps) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

type ToggleChipProps = {
  selected: boolean;
  label: string;
  onPress: () => void;
};

const ToggleChip = ({ selected, label, onPress }: ToggleChipProps) => (
  <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());
const isPhone = (value: string) => /^[0-9+()\-\s]{6,}$/.test(value.trim());

const validateConsumer = (form: typeof initialConsumer) => {
  const errors: Record<string, string> = {};
  if (!form.firstName.trim()) errors.firstName = "Required";
  if (!form.lastName.trim()) errors.lastName = "Required";
  if (!form.address.trim()) errors.address = "Required";
  const household = Number(form.householdSize);
  if (!Number.isInteger(household) || household < 1) errors.householdSize = "Must be 1 or more";
  if (!form.email.trim() || !isEmail(form.email)) errors.email = "Invalid email";
  if (form.phone && !isPhone(form.phone)) errors.phone = "Invalid phone";
  if (!form.password || form.password.length < 8) errors.password = "Min 8 characters";
  return errors;
};

const validateStaff = (form: typeof initialStaff) => {
  const errors: Record<string, string> = {};
  if (!form.firstName.trim()) errors.firstName = "Required";
  if (!form.lastName.trim()) errors.lastName = "Required";
  if (!form.address.trim()) errors.address = "Required";
  if (!form.email.trim() || !isEmail(form.email)) errors.email = "Invalid email";
  if (form.phone && !isPhone(form.phone)) errors.phone = "Invalid phone";
  if (!form.password || form.password.length < 8) errors.password = "Min 8 characters";
  if (!form.staffRole) errors.staffRole = "Select a staff role";
  return errors;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b132b" },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: "#edf2f4", fontSize: 28, fontWeight: "700", marginBottom: 16 },
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#1c2541" },
  chipSelected: { backgroundColor: "#3a506b" },
  chipText: { color: "#8d99ae", fontWeight: "600" },
  chipTextSelected: { color: "#edf2f4" },
  field: { marginBottom: 12 },
  label: { color: "#edf2f4", marginBottom: 6, fontSize: 14, fontWeight: "600" },
  input: {
    backgroundColor: "#1c2541",
    color: "#edf2f4",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1c2541",
  },
  inputError: { borderColor: "#ef233c" },
  errorText: { color: "#ef233c", fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: "#3a86ff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  message: { color: "#8ac926", marginTop: 8, marginBottom: 4 },
  hint: { color: "#adb5bd", fontSize: 12, marginTop: 12, lineHeight: 16 },
});
