import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@src/state/auth-store";
import { MobileService } from "@src/services/mobile.service";
import ScrollScreen from "@src/components/layout/scroll-screen";
import SubmitButton from "@src/components/ui/submit-button";
import LanguageToggle from "@src/screens/home/components/ui/language-toggle";
import { normalizeLocale } from "@src/constants/translations";
import { useLocaleStore } from "@src/state/locale-store";
import { useTranslation } from "@src/hooks/use-translation";
import FormField from "@src/components/ui/form-field";
import LinkButton from "@src/components/ui/link-button";
import { useTranslationsStore } from "@src/state/translations-store";

export default function ProfileEditScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentLocale = useLocaleStore((state) => state.locale);
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [refreshingTranslations, setRefreshingTranslations] = useState(false);
  const refreshAllTranslations = useTranslationsStore((state) => state.refreshAll);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    locale: normalizeLocale(user?.locale ?? currentLocale),
  });

  useEffect(() => {
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      locale: normalizeLocale(user?.locale ?? currentLocale),
    });
  }, [currentLocale, user?.firstName, user?.lastName, user?.email, user?.locale]);

  const isDirty = useMemo(() => {
    const current = {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      locale: normalizeLocale(user?.locale ?? currentLocale),
    };
    return (
      form.firstName.trim() !== current.firstName ||
      form.lastName.trim() !== current.lastName ||
      form.email.trim() !== current.email ||
      form.locale !== current.locale
    );
  }, [
    currentLocale,
    form.email,
    form.firstName,
    form.lastName,
    form.locale,
    user?.email,
    user?.firstName,
    user?.lastName,
    user?.locale,
  ]);

  const handleSave = async () => {
    if (!user || !accessToken) {
      Alert.alert(t("profile.alert.unavailableTitle"), t("profile.alert.unavailableMessage"));
      return;
    }

    const trimmed = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      locale: form.locale,
    };

    if (!trimmed.firstName || !trimmed.lastName || !trimmed.email) {
      Alert.alert(t("profile.alert.missingTitle"), t("profile.alert.missingMessage"));
      return;
    }

    setSaving(true);
    const result = await MobileService.updateProfile(trimmed);
    setSaving(false);

    if (!result.success) {
      Alert.alert(t("profile.alert.updateFailedTitle"), result.message);
      return;
    }

    Alert.alert(t("profile.alert.updatedTitle"), t("profile.alert.updatedMessage"), [
      {
        text: t("common.ok"),
        onPress: () => {
          router.replace("/home");
        },
      },
    ]);
  };

  const handleRefreshTranslations = async () => {
    if (refreshingTranslations) return;
    setRefreshingTranslations(true);
    await refreshAllTranslations();
    setRefreshingTranslations(false);
    Alert.alert(
      t("profile.alert.translationsUpdatedTitle"),
      t("profile.alert.translationsUpdatedMessage")
    );
  };

  return (
    <ScrollScreen title={t("profile.title")} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <FormField
            label={t("profile.firstNameLabel")}
            value={form.firstName}
            onChange={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
            placeholder={t("profile.firstNamePlaceholder")}
            iconName="account-outline"
            returnKeyType="next"
          />
          <FormField
            label={t("profile.lastNameLabel")}
            value={form.lastName}
            onChange={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
            placeholder={t("profile.lastNamePlaceholder")}
            iconName="account-outline"
            returnKeyType="next"
          />
          <FormField
            label={t("profile.emailLabel")}
            value={form.email}
            onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
            placeholder={t("profile.emailPlaceholder")}
            iconName="email-outline"
            keyboardType="email-address"
            returnKeyType="done"
          />
          <Text style={styles.label}>{t("profile.language")}</Text>
          <View style={styles.languageField}>
            <LanguageToggle
              value={form.locale}
              disabled={saving}
              onChange={(locale) => setForm((prev) => ({ ...prev, locale: normalizeLocale(locale) }))}
            />
          </View>
          <LinkButton
            label={
              refreshingTranslations
                ? t("profile.refreshingTranslations")
                : t("profile.refreshTranslations")
            }
            onPress={handleRefreshTranslations}
            style={styles.refreshLink}
          />
        </View>

        <View style={styles.actions}>
          <SubmitButton
            label={t("profile.save")}
            loadingLabel={t("profile.saving")}
            loading={saving}
            disabled={saving || !isDirty}
            onPress={handleSave}
          />
        </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  languageField: { alignItems: "flex-start", marginBottom: 14 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  label: { color: "#5a6b95", fontSize: 12, fontWeight: "600", marginBottom: 6 },
  refreshLink: { alignSelf: "flex-start", marginTop: 4 },
  actions: { marginTop: 20 },
});
