import { useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { AccountsService } from "@src/services/accounts";
import ApiFeedback from "@src/components/ui/api-feedback";
import LinkButton from "@src/components/ui/link-button";
import SubmitButton from "@src/components/ui/submit-button";
import AuthScreenLayout from "@src/screens/auth/components/layout/auth-screen-layout";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import { useTranslation } from "@src/hooks/use-translation";

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
  const { t } = useTranslation();
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

  const formErrors = useMemo(() => validateForm(form, t), [form, t]);

  const onSubmit = async () => {
    if (Object.keys(formErrors).length > 0) {
      Alert.alert(t("auth.login.validationError"));
      return;
    }

    setLoading(true);
    setMessage(null);

    const { identifier, householdSize, ...rest } = form;
    const result = await AccountsService.register({
      ...rest,
      email: identifier,
      householdSize: Number(householdSize),
    });

    setLoading(false);
    if (result.success) {
      setMessage(t("auth.register.success"));
      return;
    }
    setMessage(result.message);
  };

  return (
    <AuthScreenLayout paddingBottom={140}>
      <AuthHeader title={t("auth.register.title")} subtitle={t("auth.register.subtitle")} />

        <AuthField
          label={t("auth.register.firstNameLabel")}
          value={form.firstName}
          onChange={(value) => setForm({ ...form, firstName: value })}
          iconName="account-outline"
          returnKeyType="next"
          inputRef={refs.firstName}
          onSubmitEditing={() => refs.lastName.current?.focus()}
          error={formErrors.firstName}
        />
        <AuthField
          label={t("auth.register.lastNameLabel")}
          value={form.lastName}
          onChange={(value) => setForm({ ...form, lastName: value })}
          iconName="account-outline"
          returnKeyType="next"
          inputRef={refs.lastName}
          onSubmitEditing={() => refs.address.current?.focus()}
          error={formErrors.lastName}
        />
        <AuthField
          label={t("auth.register.addressLabel")}
          value={form.address}
          onChange={(value) => setForm({ ...form, address: value })}
          iconName="home-outline"
          returnKeyType="next"
          inputRef={refs.address}
          onSubmitEditing={() => refs.householdSize.current?.focus()}
          error={formErrors.address}
        />
        <AuthField
          label={t("auth.register.householdSizeLabel")}
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
          label={t("auth.register.identifierLabel")}
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
          label={t("auth.register.phoneLabel")}
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
          label={t("auth.register.passwordLabel")}
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
          secureTextEntry
          iconName="lock-outline"
          returnKeyType="done"
          inputRef={refs.password}
          error={formErrors.password}
        />

        <ApiFeedback message={message} />

        <SubmitButton
          label={t("auth.register.submit")}
          loadingLabel={t("auth.register.loading")}
          loading={loading}
          onPress={onSubmit}
        />

        <LinkButton label={t("auth.register.backToLogin")} onPress={() => router.push("/login")} />

        <Text style={styles.hint}>
          {t("auth.register.hint")}
        </Text>
    </AuthScreenLayout>
  );
}

const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());
const isPhone = (value: string) => /^[0-9+()\-\s]{6,}$/.test(value.trim());

const validateForm = (form: typeof initialForm, t: (key: string) => string) => {
  const errors: Record<string, string> = {};
  if (!form.firstName.trim()) errors.firstName = t("validation.required");
  if (!form.lastName.trim()) errors.lastName = t("validation.required");
  if (!form.address.trim()) errors.address = t("validation.required");
  const household = Number(form.householdSize);
  if (!Number.isInteger(household) || household < 1) errors.householdSize = t("validation.householdMin");
  if (!form.identifier.trim()) errors.identifier = t("validation.required");
  if (form.identifier.includes("@") && !isEmail(form.identifier))
    errors.identifier = t("validation.invalidEmail");
  if (!form.phone.trim()) errors.phone = t("validation.required");
  if (!isPhone(form.phone)) errors.phone = t("validation.invalidPhone");
  if (!form.password || form.password.length < 8) errors.password = t("validation.min8");
  return errors;
};

const styles = StyleSheet.create({
  hint: { color: "#7c8bb5", fontSize: 12, marginTop: 12, lineHeight: 16, textAlign: "center" },
});
