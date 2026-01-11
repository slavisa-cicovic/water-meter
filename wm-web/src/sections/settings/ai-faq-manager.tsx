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

type DraftEntry = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
};

export default function AiFaqManager() {
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
      setError("Failed to save FAQ entry.");
    } finally {
      setSavingId(null);
    }
  };

  const handleCreate = async () => {
    setError(null);
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError("Question and answer are required.");
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
      setError("Failed to create FAQ entry.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">AI FAQ Snippets</Typography>
            <Typography variant="body2" color="text.secondary">
              These entries are injected into the AI prompt.
            </Typography>
          </Box>

          {entriesError ? <Alert severity="error">Failed to load FAQ entries.</Alert> : null}
          {entriesLoading ? <Alert severity="info">Loading FAQ entries...</Alert> : null}

          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {localDrafts.map((entry) => (
              <Stack key={entry.id} spacing={1.5}>
                <TextField
                  label="Question"
                  value={entry.question}
                  onChange={(event) => handleFieldChange(entry.id, "question", event.target.value)}
                  size="small"
                />
                <TextField
                  label="Answer"
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
                      Active
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSave(entry)}
                    disabled={savingId === entry.id || !isEntryDirty(entry)}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>
            ))}
            {localDrafts.length === 0 && !entriesLoading ? (
              <Typography variant="body2" color="text.secondary">
                No FAQ entries yet.
              </Typography>
            ) : null}
          </Stack>

          <Divider flexItem />

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Add new entry</Typography>
            <TextField
              label="Question"
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value)}
              size="small"
            />
            <TextField
              label="Answer"
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
                  Active
                </Typography>
              </Stack>
              <Button
                variant="contained"
                size="small"
                onClick={handleCreate}
                disabled={savingId === "new" || !newQuestion.trim() || !newAnswer.trim()}
              >
                Add
              </Button>
            </Stack>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
