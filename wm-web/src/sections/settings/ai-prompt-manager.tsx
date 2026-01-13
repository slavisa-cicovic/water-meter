"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { SettingsApi, useGetSettings } from "src/api/settings";
import { useLocales } from "src/locales";

export default function AiPromptManager() {
  const { t } = useLocales();
  const { settings, mutate } = useGetSettings();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(settings?.aiSystemPrompt ?? "");
  }, [settings?.aiSystemPrompt]);

  const isDirty = (settings?.aiSystemPrompt ?? "") !== value.trim();

  const handleSave = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      await SettingsApi.updateSetting({ key: "ai.systemPrompt", value: value.trim() || null });
      await mutate();
    } catch (err) {
      setError(t("settings.aiPrompt.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  }, [mutate, t, value]);

  const handleCancel = useCallback(() => {
    setValue(settings?.aiSystemPrompt ?? "");
    setError(null);
  }, [settings?.aiSystemPrompt]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">{t("settings.aiPrompt.title")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("settings.aiPrompt.subtitle")}
            </Typography>
          </Box>
          <TextField
            value={value}
            onChange={(event) => setValue(event.target.value)}
            minRows={6}
            multiline
            placeholder={t("settings.aiPrompt.placeholder")}
            size="small"
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
              {t("settings.actions.cancel")}
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={saving || !isDirty}>
              {t("settings.actions.save")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
