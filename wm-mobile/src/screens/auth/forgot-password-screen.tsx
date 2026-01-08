import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { ForgotPasswordService } from "@src/services/auth/forgot-password.service";
import ApiFeedback from "@src/components/ui/api-feedback";
import LinkButton from "@src/components/ui/link-button";
import SubmitButton from "@src/components/ui/submit-button";
import AuthScreenLayout from "@src/screens/auth/components/layout/auth-screen-layout";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import AuthHero from "@src/screens/auth/components/ui/auth-hero";
import { useTranslation } from "@src/hooks/use-translation";

const initialForm = {
  identifier: "",
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const formErrors = useMemo(() => validateForm(form, t), [form, t]);

  const onSubmit = async () => {
    if (Object.keys(formErrors).length > 0) {
      Alert.alert(t("auth.forgot.validationError"));
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await ForgotPasswordService.request(form);
    setLoading(false);

    if (result.success) {
      setMessage(t("auth.forgot.success"));
      return;
    }

    setMessage(result.message);
  };

  return (
    <AuthScreenLayout paddingBottom={100}>
      <AuthHero />
      <AuthHeader title={t("auth.forgot.title")} subtitle={t("auth.forgot.subtitle")} />

      <AuthField
        label={t("auth.forgot.identifierLabel")}
        value={form.identifier}
        onChange={(value) => setForm({ identifier: value })}
        placeholder={t("auth.forgot.identifierPlaceholder")}
        keyboardType="default"
        iconName="account-outline"
        error={formErrors.identifier}
      />

      <ApiFeedback message={message} />

      <SubmitButton
        label={t("auth.forgot.submit")}
        loadingLabel={t("auth.forgot.loading")}
        loading={loading}
        onPress={onSubmit}
      />

      <LinkButton label={t("auth.forgot.backToLogin")} onPress={() => router.push("/login")} />
    </AuthScreenLayout>
  );
}

const validateForm = (form: typeof initialForm, t: (key: string) => string) => {
  const errors: Record<string, string> = {};
  if (!form.identifier.trim()) errors.identifier = t("validation.required");
  return errors;
};
