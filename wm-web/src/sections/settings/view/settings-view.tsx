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
import { CurrentMonthMode, SettingsUpdateInput } from "src/types/settings";
import { paths } from "src/routes/paths";

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function SettingsView() {
  const settings = useSettingsContext();
  const { settings: data, settingsLoading, settingsError, mutate } = useGetSettings();

  const [monthMode, setMonthMode] = useState<CurrentMonthMode>("auto");
  const [monthValue, setMonthValue] = useState<number | null>(null);
  const [currency, setCurrency] = useState("");
  const [savingMonth, setSavingMonth] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [monthError, setMonthError] = useState<string | null>(null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setMonthMode(data.currentMonthMode);
    setMonthValue(data.currentMonthValue);
    setCurrency(data.currency);
  }, [data]);

  const monthDisplay = useMemo(() => {
    if (monthMode === "auto") return "Auto (current date)";
    const match = MONTH_OPTIONS.find((option) => option.value === monthValue);
    return match ? match.label : "-";
  }, [monthMode, monthValue]);

  const handleSaveMonth = useCallback(async () => {
    setMonthError(null);
    if (monthMode === "manual" && (!monthValue || monthValue < 1 || monthValue > 12)) {
      setMonthError("Please select a valid month.");
      return;
    }

    setSavingMonth(true);
    try {
      const updates: SettingsUpdateInput[] = [
        { key: "currentMonth.mode", value: monthMode },
        {
          key: "currentMonth.value",
          value: monthMode === "manual" ? monthValue : null,
        },
      ];
      await Promise.all(updates.map((payload) => SettingsApi.updateSetting(payload)));
      await mutate();
    } catch (error) {
      setMonthError("Unable to save current month settings.");
    } finally {
      setSavingMonth(false);
    }
  }, [monthMode, monthValue, mutate]);

  const handleCancelMonth = useCallback(() => {
    if (!data) return;
    setMonthMode(data.currentMonthMode);
    setMonthValue(data.currentMonthValue);
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
                  <Typography variant="h6">Current Month</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mode: {monthDisplay}
                  </Typography>

                  <TextField
                    select
                    label="Mode"
                    value={monthMode}
                    onChange={(event) => setMonthMode(event.target.value as CurrentMonthMode)}
                    size="small"
                  >
                    <MenuItem value="auto">Auto (use new Date())</MenuItem>
                    <MenuItem value="manual">Manual</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Month"
                    value={monthValue ?? ""}
                    onChange={(event) => setMonthValue(event.target.value === "" ? null : Number(event.target.value))}
                    size="small"
                    disabled={monthMode === "auto"}
                  >
                    <MenuItem value="">Select month</MenuItem>
                    {MONTH_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  {monthError ? <Alert severity="error">{monthError}</Alert> : null}
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" onClick={handleCancelMonth} disabled={savingMonth}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSaveMonth} disabled={savingMonth}>
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
    </Container>
  );
}
