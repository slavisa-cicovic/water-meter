"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SettingsApi, useGetSettings } from "src/api/settings";
import { useLocales } from "src/locales";
import { useAuthContext } from "src/auth/hooks";
import { PERMISSIONS } from "src/constants/permissions";
import { SettingsUpdateInput } from "src/types/settings";

export default function CompanyProfileManager() {
  const { t } = useLocales();
  const { user } = useAuthContext();
  const { settings: data, settingsLoading, settingsError, mutate } = useGetSettings();
  const userPermissions = (user?.permissions as string[]) || [];
  const canUpdateSettings = userPermissions.includes(PERMISSIONS.SETTINGS_UPDATE);

  const [savingCompany, setSavingCompany] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyZip, setCompanyZip] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState("");
  const [companyCompanyNumber, setCompanyCompanyNumber] = useState("");
  const [companyTaxId, setCompanyTaxId] = useState("");

  useEffect(() => {
    if (!data) return;
    setCompanyLogoUrl(data.companyLogoUrl || "");
    setCompanyName(data.companyName || "");
    setCompanyAddress(data.companyAddress || "");
    setCompanyZip(data.companyZip || "");
    setCompanyCity(data.companyCity || "");
    setCompanyRegistrationNumber(data.companyRegistrationNumber || "");
    setCompanyCompanyNumber(data.companyCompanyNumber || "");
    setCompanyTaxId(data.companyTaxId || "");
  }, [data]);

  const isCompanyDirty = useMemo(() => {
    if (!data) return false;
    return (
      data.companyLogoUrl !== companyLogoUrl.trim() ||
      data.companyName !== companyName.trim() ||
      data.companyAddress !== companyAddress.trim() ||
      data.companyZip !== companyZip.trim() ||
      data.companyCity !== companyCity.trim() ||
      data.companyRegistrationNumber !== companyRegistrationNumber.trim() ||
      data.companyCompanyNumber !== companyCompanyNumber.trim() ||
      data.companyTaxId !== companyTaxId.trim()
    );
  }, [
    data,
    companyLogoUrl,
    companyName,
    companyAddress,
    companyZip,
    companyCity,
    companyRegistrationNumber,
    companyCompanyNumber,
    companyTaxId,
  ]);

  const handleSaveCompany = useCallback(async () => {
    setCompanyError(null);
    setSavingCompany(true);
    try {
      const updates: SettingsUpdateInput[] = [
        { key: "company.logoUrl", value: companyLogoUrl.trim() },
        { key: "company.name", value: companyName.trim() },
        { key: "company.address", value: companyAddress.trim() },
        { key: "company.zip", value: companyZip.trim() },
        { key: "company.city", value: companyCity.trim() },
        { key: "company.registrationNumber", value: companyRegistrationNumber.trim() },
        { key: "company.companyNumber", value: companyCompanyNumber.trim() },
        { key: "company.taxId", value: companyTaxId.trim() },
      ];
      await Promise.all(updates.map((payload) => SettingsApi.updateSetting(payload)));
      await mutate();
    } catch (error) {
      setCompanyError(t("settings.company.errors.saveFailed"));
    } finally {
      setSavingCompany(false);
    }
  }, [
    companyAddress,
    companyCity,
    companyCompanyNumber,
    companyLogoUrl,
    companyName,
    companyRegistrationNumber,
    companyTaxId,
    companyZip,
    mutate,
    t,
  ]);

  const handleCancelCompany = useCallback(() => {
    if (!data) return;
    setCompanyLogoUrl(data.companyLogoUrl || "");
    setCompanyName(data.companyName || "");
    setCompanyAddress(data.companyAddress || "");
    setCompanyZip(data.companyZip || "");
    setCompanyCity(data.companyCity || "");
    setCompanyRegistrationNumber(data.companyRegistrationNumber || "");
    setCompanyCompanyNumber(data.companyCompanyNumber || "");
    setCompanyTaxId(data.companyTaxId || "");
    setCompanyError(null);
  }, [data]);

  return (
    <Card sx={{ gridColumn: { xs: "1 / -1", sm: "span 2", lg: "span 2" } }}>
      <CardContent sx={{ height: "100%" }}>
        <Stack spacing={2} sx={{ height: "100%" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{t("settings.company.title")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("settings.company.subtitle")}
            </Typography>

            {settingsError ? <Alert severity="error">{t("settings.errors.loadFailed")}</Alert> : null}
            {settingsLoading ? <Alert severity="info">{t("settings.loading")}</Alert> : null}

            <Box
              display="grid"
              columnGap={2}
              rowGap={2}
              gridTemplateColumns={{ xs: "1fr", md: "200px 1fr 1fr" }}
              sx={{ mt: 2 }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 160,
                    height: 160,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    bgcolor: "background.neutral",
                  }}
                >
                  <Box
                    component="img"
                    src={companyLogoUrl.trim() || "/logo/logo.png"}
                    alt={companyName || "Company logo"}
                    sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
                <TextField
                  label={t("settings.company.logo")}
                  value={companyLogoUrl}
                  onChange={(event) => setCompanyLogoUrl(event.target.value)}
                  size="small"
                  disabled={!canUpdateSettings}
                />
              </Stack>

              <Stack spacing={2}>
                <TextField
                  label={t("settings.company.name")}
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  size="small"
                  disabled={!canUpdateSettings}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label={t("settings.company.zip")}
                    value={companyZip}
                    onChange={(event) => setCompanyZip(event.target.value)}
                    size="small"
                    disabled={!canUpdateSettings}
                  />
                  <TextField
                    label={t("settings.company.city")}
                    value={companyCity}
                    onChange={(event) => setCompanyCity(event.target.value)}
                    size="small"
                    disabled={!canUpdateSettings}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label={t("settings.company.address")}
                  value={companyAddress}
                  onChange={(event) => setCompanyAddress(event.target.value)}
                  size="small"
                  disabled={!canUpdateSettings}
                />
              </Stack>

              <Stack spacing={2}>
                <TextField
                  label={t("settings.company.registrationNumber")}
                  value={companyRegistrationNumber}
                  onChange={(event) => setCompanyRegistrationNumber(event.target.value)}
                  size="small"
                  disabled={!canUpdateSettings}
                />
                <TextField
                  label={t("settings.company.companyNumber")}
                  value={companyCompanyNumber}
                  onChange={(event) => setCompanyCompanyNumber(event.target.value)}
                  size="small"
                  disabled={!canUpdateSettings}
                />
                <TextField
                  label={t("settings.company.taxId")}
                  value={companyTaxId}
                  onChange={(event) => setCompanyTaxId(event.target.value)}
                  size="small"
                  disabled={!canUpdateSettings}
                />
              </Stack>
            </Box>

            {companyError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {companyError}
              </Alert>
            ) : null}
          </Box>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleCancelCompany} disabled={savingCompany || !canUpdateSettings}>
              {t("settings.actions.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveCompany}
              disabled={savingCompany || !isCompanyDirty || !canUpdateSettings}
            >
              {t("settings.actions.save")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
