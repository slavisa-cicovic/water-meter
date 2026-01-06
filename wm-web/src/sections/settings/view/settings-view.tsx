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

const formatDateLabel = (value: string | null) => value ?? "-";

export function SettingsView() {
  const settings = useSettingsContext();
  const { settings: data, settingsLoading, settingsError, mutate } = useGetSettings();

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
    if (dateMode === "auto") return "Auto (current date)";
    return formatDateLabel(dateValue);
  }, [dateMode, dateValue]);

  const handleSaveDate = useCallback(async () => {
    setMonthError(null);
    if (dateMode === "manual" && (!dateValue || !dateValue.trim())) {
      setMonthError("Please select a valid date.");
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
      setMonthError("Unable to save current date settings.");
    } finally {
      setSavingMonth(false);
    }
  }, [dateMode, dateValue, mutate]);

  const handleCancelDate = useCallback(() => {
    if (!data) return;
    setDateMode(data.currentDateMode);
    setDateValue(data.currentDateValue);
    setMonthError(null);
  }, [data]);

  const handleSaveCurrency = useCallback(async () => {
    setCurrencyError(null);
    if (!currency.trim()) {
      setCurrencyError("Currency is required.");
      return;
    }
    setSavingCurrency(true);
    try {
      await SettingsApi.updateSetting({ key: "currency", value: currency.trim() });
      await mutate();
    } catch (error) {
      setCurrencyError("Unable to save currency.");
    } finally {
      setSavingCurrency(false);
    }
  }, [currency, mutate]);

  const handleCancelCurrency = useCallback(() => {
    if (!data) return;
    setCurrency(data.currency);
    setCurrencyError(null);
  }, [data]);

  return (
    <Container maxWidth={settings.themeStretch ? false : "lg"}>
      <CustomBreadcrumbs
        heading="Settings"
        description="Admin settings for month evaluation and currency."
        links={[
          { name: "App", href: paths.dashboard.root },
          { name: "Settings" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {settingsError ? <Alert severity="error">Unable to load settings.</Alert> : null}
      {settingsLoading ? <Alert severity="info">Loading settings...</Alert> : null}

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
              <Typography variant="h6">Current Date</Typography>
              <Typography variant="body2" color="text.secondary">
                Mode: {dateDisplay}
              </Typography>

                <TextField
                  select
                  label="Mode"
                  value={dateMode}
                  onChange={(event) => setDateMode(event.target.value as CurrentDateMode)}
                  size="small"
                >
                  <MenuItem value="auto">Auto (use new Date())</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </TextField>

                <TextField
                  label="Date"
                  type="date"
                  value={dateValue ?? ""}
                  onChange={(event) => setDateValue(event.target.value || null)}
                  size="small"
                  disabled={dateMode === "auto"}
                  InputLabelProps={{ shrink: true }}
                >
                </TextField>

                  {monthError ? <Alert severity="error">{monthError}</Alert> : null}
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" onClick={handleCancelDate} disabled={savingMonth}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSaveDate} disabled={savingMonth}>
                    Save
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ height: "100%" }}>
              <Stack spacing={2} sx={{ height: "100%" }}>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h6">Currency</Typography>
                  <TextField
                    label="Currency"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    size="small"
                  />
                  {currencyError ? <Alert severity="error">{currencyError}</Alert> : null}
                </Box>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" onClick={handleCancelCurrency} disabled={savingCurrency}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSaveCurrency} disabled={savingCurrency}>
                    Save
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
      </Box>

      <RoleBasedGuard permissions={[PERMISSIONS.ROLES_UPDATE]} sx={{ mt: 3 }}>
        <Box sx={{ mt: 3 }}>
          <RolePermissionsManager />
        </Box>
      </RoleBasedGuard>
    </Container>
  );
}
