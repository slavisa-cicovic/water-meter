"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { AiFaqApi, useGetAiFaqEntries } from "src/api/ai-faq";
import { useLocales } from "src/locales";

type DraftEntry = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
};

export default function AiFaqManager() {
  const { t } = useLocales();
  const { entries, entriesLoading, entriesError, mutate } = useGetAiFaqEntries();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newActive, setNewActive] = useState(true);

  const drafts = useMemo(
    () =>
      entries.map((entry) => ({
        id: entry.id,
        question: entry.question,
        answer: entry.answer,
        isActive: entry.isActive,
      })),
    [entries]
  );

  const [localDrafts, setLocalDrafts] = useState<DraftEntry[]>([]);

  useEffect(() => {
    setLocalDrafts(drafts);
  }, [drafts]);

  const handleFieldChange = (id: string, field: keyof DraftEntry, value: string | boolean) => {
    setLocalDrafts((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const isEntryDirty = useCallback(
    (entry: DraftEntry) => {
      const original = entries.find((item) => item.id === entry.id);
      if (!original) return false;
      return (
        original.question !== entry.question ||
        original.answer !== entry.answer ||
        original.isActive !== entry.isActive
      );
    },
    [entries]
  );

  const handleSave = async (entry: DraftEntry) => {
    setError(null);
    setSavingId(entry.id);
    try {
      await AiFaqApi.update(entry);
      await mutate();
    } catch (err) {
      setError(t("settings.aiFaq.errors.saveFailed"));
    } finally {
      setSavingId(null);
    }
  };

  const handleCreate = async () => {
    setError(null);
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError(t("settings.aiFaq.errors.required"));
      return;
    }
    setSavingId("new");
    try {
      await AiFaqApi.create({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        isActive: newActive,
      });
      setNewQuestion("");
      setNewAnswer("");
      setNewActive(true);
      await mutate();
    } catch (err) {
      setError(t("settings.aiFaq.errors.createFailed"));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">{t("settings.aiFaq.title")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("settings.aiFaq.subtitle")}
            </Typography>
          </Box>

          {entriesError ? <Alert severity="error">{t("settings.aiFaq.loadError")}</Alert> : null}
          {entriesLoading ? <Alert severity="info">{t("settings.aiFaq.loading")}</Alert> : null}

          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {localDrafts.map((entry) => (
              <Stack key={entry.id} spacing={1.5}>
                <TextField
                  label={t("settings.aiFaq.fields.question")}
                  value={entry.question}
                  onChange={(event) => handleFieldChange(entry.id, "question", event.target.value)}
                  size="small"
                />
                <TextField
                  label={t("settings.aiFaq.fields.answer")}
                  value={entry.answer}
                  onChange={(event) => handleFieldChange(entry.id, "answer", event.target.value)}
                  size="small"
                  multiline
                  minRows={3}
                />
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Switch
                      checked={entry.isActive}
                      onChange={(event) => handleFieldChange(entry.id, "isActive", event.target.checked)}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.aiFaq.fields.active")}
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSave(entry)}
                    disabled={savingId === entry.id || !isEntryDirty(entry)}
                  >
                    {t("settings.aiFaq.actions.save")}
                  </Button>
                </Stack>
              </Stack>
            ))}
            {localDrafts.length === 0 && !entriesLoading ? (
              <Typography variant="body2" color="text.secondary">
                {t("settings.aiFaq.empty")}
              </Typography>
            ) : null}
          </Stack>

          <Divider flexItem />

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t("settings.aiFaq.newTitle")}</Typography>
            <TextField
              label={t("settings.aiFaq.fields.question")}
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value)}
              size="small"
            />
            <TextField
              label={t("settings.aiFaq.fields.answer")}
              value={newAnswer}
              onChange={(event) => setNewAnswer(event.target.value)}
              size="small"
              multiline
              minRows={3}
            />
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch checked={newActive} onChange={(event) => setNewActive(event.target.checked)} />
                <Typography variant="body2" color="text.secondary">
                  {t("settings.aiFaq.fields.active")}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                size="small"
                onClick={handleCreate}
                disabled={savingId === "new" || !newQuestion.trim() || !newAnswer.trim()}
              >
                {t("settings.aiFaq.actions.add")}
              </Button>
            </Stack>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
