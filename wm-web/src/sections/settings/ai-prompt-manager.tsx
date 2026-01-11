"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { SettingsApi, useGetSettings } from "src/api/settings";

export default function AiPromptManager() {
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
      setError("Failed to save prompt.");
    } finally {
      setSaving(false);
    }
  }, [mutate, value]);

  const handleCancel = useCallback(() => {
    setValue(settings?.aiSystemPrompt ?? "");
    setError(null);
  }, [settings?.aiSystemPrompt]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">AI System Prompt</Typography>
            <Typography variant="body2" color="text.secondary">
              Controls the assistant behavior for AI replies.
            </Typography>
          </Box>
          <TextField
            value={value}
            onChange={(event) => setValue(event.target.value)}
            minRows={6}
            multiline
            placeholder="Enter system prompt..."
            size="small"
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={saving || !isDirty}>
              Save
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
