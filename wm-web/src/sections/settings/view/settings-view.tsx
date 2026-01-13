"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import { useSettingsContext } from "src/components/settings";
import { SettingsApi, useGetSettings } from "src/api/settings";
import { CurrentDateMode, SettingsUpdateInput } from "src/types/settings";
import { paths } from "src/routes/paths";
import RoleBasedGuard from "src/auth/guard/role-based-guard";
import { PERMISSIONS } from "src/constants/permissions";
import RolePermissionsManager from "../role-permissions-manager";
import TranslationManager from "../translation-manager";
import AiPromptManager from "../ai-prompt-manager";
import AiFaqManager from "../ai-faq-manager";
import { useLocales } from "src/locales";
import { useAuthContext } from "src/auth/hooks";

const formatDateLabel = (value: string | null) => value ?? "-";

export function SettingsView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { user } = useAuthContext();
  const { settings: data, settingsLoading, settingsError, mutate } = useGetSettings();
  const userPermissions = (user?.permissions as string[]) || [];
  const canUpdateSettings = userPermissions.includes(PERMISSIONS.SETTINGS_UPDATE);

  const [dateMode, setDateMode] = useState<CurrentDateMode>("auto");
  const [dateValue, setDateValue] = useState<string | null>(null);
  const [currency, setCurrency] = useState("");
  const [savingMonth, setSavingMonth] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [monthError, setMonthError] = useState<string | null>(null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setDateMode(data.currentDateMode);
    setDateValue(data.currentDateValue);
    setCurrency(data.currency);
  }, [data]);

  const dateDisplay = useMemo(() => {
    if (dateMode === "auto") return t("settings.currentDate.autoDisplay");
    return dateValue ? formatDateLabel(dateValue) : t("settings.currentDate.empty");
  }, [dateMode, dateValue, t]);

  const isDateDirty = useMemo(() => {
    if (!data) return false;
    return data.currentDateMode !== dateMode || data.currentDateValue !== dateValue;
  }, [data, dateMode, dateValue]);

  const isCurrencyDirty = useMemo(() => {
    if (!data) return false;
    return data.currency !== currency.trim();
  }, [data, currency]);

  const handleSaveDate = useCallback(async () => {
    setMonthError(null);
    if (dateMode === "manual" && (!dateValue || !dateValue.trim())) {
      setMonthError(t("settings.currentDate.errors.invalidDate"));
      return;
    }

    setSavingMonth(true);
    try {
      const updates: SettingsUpdateInput[] = [
        { key: "currentDate.mode", value: dateMode },
        {
          key: "currentDate.value",
          value: dateMode === "manual" ? dateValue : null,
        },
      ];
      await Promise.all(updates.map((payload) => SettingsApi.updateSetting(payload)));
      await mutate();
    } catch (error) {
      setMonthError(t("settings.currentDate.errors.saveFailed"));
    } finally {
      setSavingMonth(false);
    }
  }, [dateMode, dateValue, mutate, t]);

  const handleCancelDate = useCallback(() => {
    if (!data) return;
    setDateMode(data.currentDateMode);
    setDateValue(data.currentDateValue);
    setMonthError(null);
  }, [data]);

  const handleSaveCurrency = useCallback(async () => {
    setCurrencyError(null);
    if (!currency.trim()) {
      setCurrencyError(t("settings.currency.errors.required"));
      return;
    }
    setSavingCurrency(true);
    try {
      await SettingsApi.updateSetting({ key: "currency", value: currency.trim() });
      await mutate();
    } catch (error) {
      setCurrencyError(t("settings.currency.errors.saveFailed"));
    } finally {
      setSavingCurrency(false);
    }
  }, [currency, mutate, t]);

  const handleCancelCurrency = useCallback(() => {
    if (!data) return;
    setCurrency(data.currency);
    setCurrencyError(null);
  }, [data]);

  return (
    <Container maxWidth={settings.themeStretch ? false : "lg"}>
      <CustomBreadcrumbs
        heading={t("settings.title")}
        description={t("settings.description")}
        links={[
          { name: t("sidebar.app"), href: paths.dashboard.root },
          { name: t("sidebar.settings") },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {settingsError ? <Alert severity="error">{t("settings.errors.loadFailed")}</Alert> : null}
      {settingsLoading ? <Alert severity="info">{t("settings.loading")}</Alert> : null}

      <Box
        rowGap={2}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
        sx={{ mt: 1 }}
      >
          <Card>
            <CardContent sx={{ height: "100%" }}>
              <Stack spacing={2} sx={{ height: "100%" }}>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h6">{t("settings.currentDate.title")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.currentDate.modeLabel")}: {dateDisplay}
                  </Typography>

                  <TextField
                    select
                    label={t("settings.currentDate.modeField")}
                    value={dateMode}
                    onChange={(event) => setDateMode(event.target.value as CurrentDateMode)}
                    size="small"
                    disabled={!canUpdateSettings}
                  >
                    <MenuItem value="auto">{t("settings.currentDate.modes.auto")}</MenuItem>
                    <MenuItem value="manual">{t("settings.currentDate.modes.manual")}</MenuItem>
                  </TextField>

                  <TextField
                    label={t("settings.currentDate.dateField")}
                    type="date"
                    value={dateValue ?? ""}
                    onChange={(event) => setDateValue(event.target.value || null)}
                    size="small"
                    disabled={!canUpdateSettings || dateMode === "auto"}
                    InputLabelProps={{ shrink: true }}
                  >
                  </TextField>

                  {monthError ? <Alert severity="error">{monthError}</Alert> : null}
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" onClick={handleCancelDate} disabled={savingMonth || !canUpdateSettings}>
                    {t("settings.actions.cancel")}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveDate}
                    disabled={savingMonth || !isDateDirty || !canUpdateSettings}
                  >
                    {t("settings.actions.save")}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ height: "100%" }}>
              <Stack spacing={2} sx={{ height: "100%" }}>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h6">{t("settings.currency.title")}</Typography>
                  <TextField
                    label={t("settings.currency.field")}
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    size="small"
                    disabled={!canUpdateSettings}
                  />
                  {currencyError ? <Alert severity="error">{currencyError}</Alert> : null}
                </Box>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleCancelCurrency}
                    disabled={savingCurrency || !canUpdateSettings}
                  >
                    {t("settings.actions.cancel")}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveCurrency}
                    disabled={savingCurrency || !isCurrencyDirty || !canUpdateSettings}
                  >
                    {t("settings.actions.save")}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
      </Box>

      <Box
        display="grid"
        columnGap={2}
        rowGap={2}
        gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }}
        sx={{ mt: 3 }}
      >
        <RoleBasedGuard roles={["super_admin"]} hasContent={false}>
          <AiPromptManager />
        </RoleBasedGuard>
        <RoleBasedGuard roles={["super_admin"]} hasContent={false}>
          <AiFaqManager />
        </RoleBasedGuard>
        <RoleBasedGuard permissions={[PERMISSIONS.ROLES_UPDATE]} hasContent={false}>
          <RolePermissionsManager />
        </RoleBasedGuard>
        <RoleBasedGuard permissions={[PERMISSIONS.TRANSLATIONS_READ]} hasContent={false}>
          <TranslationManager />
        </RoleBasedGuard>
      </Box>

    </Container>
  );
}
