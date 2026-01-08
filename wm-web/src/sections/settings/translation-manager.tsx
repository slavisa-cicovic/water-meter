"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuthContext } from "src/auth/hooks";
import { PERMISSIONS } from "src/constants/permissions";
import { TranslationsApi, useGetTranslations } from "src/api/translations";
import { TranslationBundle } from "src/types/translations";

const SUPPORTED_LOCALES = ["en", "sr-Latn", "sr-Cyrl"];

export default function TranslationManager() {
  const { user } = useAuthContext();
  const [locale, setLocale] = useState("en");
  const [filter, setFilter] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canEdit = user?.permissions?.includes(PERMISSIONS.TRANSLATIONS_UPDATE) ?? false;
  const { bundle, translationsLoading, translationsError, mutate } = useGetTranslations(locale);
  const {
    bundle: enBundle,
    translationsLoading: enLoading,
    translationsError: enError,
  } = useGetTranslations("en");
  const {
    bundle: srLatnBundle,
    translationsLoading: srLatnLoading,
    translationsError: srLatnError,
  } = useGetTranslations("sr-Latn");
  const {
    bundle: srCyrlBundle,
    translationsLoading: srCyrlLoading,
    translationsError: srCyrlError,
  } = useGetTranslations("sr-Cyrl");

  const entries = useMemo(() => {
    const data = bundle?.translations ?? {};
    const normalizedFilter = filter.trim().toLowerCase();
    return Object.keys(data)
      .sort()
      .filter((key) => !normalizedFilter || key.toLowerCase().includes(normalizedFilter))
      .map((key) => ({
        key,
        value: drafts[key] ?? data[key],
        original: data[key],
      }));
  }, [bundle?.translations, drafts, filter]);

  const groupedEntries = useMemo(() => {
    return entries.reduce<Record<string, typeof entries>>((acc, entry) => {
      const prefix = entry.key.split(".")[0] || "other";
      acc[prefix] = acc[prefix] || [];
      acc[prefix].push(entry);
      return acc;
    }, {});
  }, [entries]);

  const { missingByKey, missingCount } = useMemo(() => {
    const bundlesByLocale: Record<string, TranslationBundle | null> = {
      en: enBundle,
      "sr-Latn": srLatnBundle,
      "sr-Cyrl": srCyrlBundle,
    };
    const keys = new Set<string>();

    SUPPORTED_LOCALES.forEach((supportedLocale) => {
      const translations = bundlesByLocale[supportedLocale]?.translations ?? {};
      Object.keys(translations).forEach((key) => keys.add(key));
    });

    const nextMissingByKey: Record<string, string[]> = {};
    let nextMissingCount = 0;

    keys.forEach((key) => {
      SUPPORTED_LOCALES.forEach((supportedLocale) => {
        const value = bundlesByLocale[supportedLocale]?.translations?.[key];
        if (value === undefined || value === null || value === "") {
          nextMissingCount += 1;
          if (!nextMissingByKey[key]) {
            nextMissingByKey[key] = [];
          }
          nextMissingByKey[key].push(supportedLocale);
        }
      });
    });

    return { missingByKey: nextMissingByKey, missingCount: nextMissingCount };
  }, [enBundle, srLatnBundle, srCyrlBundle]);

  const healthLoading = enLoading || srLatnLoading || srCyrlLoading;
  const healthError = enError || srLatnError || srCyrlError;

  const hasChanges = useMemo(
    () => entries.some((entry) => entry.value !== entry.original),
    [entries]
  );

  const handleChange = useCallback((key: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setDrafts({});
    setSaveError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!bundle || !canEdit) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updates = entries
        .filter((entry) => entry.value !== entry.original)
        .map((entry) => ({ key: entry.key, value: entry.value }));
      await TranslationsApi.updateTranslations({ locale, updates });
      await mutate();
      setDrafts({});
    } catch (error) {
      setSaveError("Unable to update translations.");
    } finally {
      setSaving(false);
    }
  }, [bundle, canEdit, entries, locale, mutate]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Translations</Typography>
            <Typography variant="body2" color="text.secondary">
              Keys are locked; update values only.
            </Typography>
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: healthError
                ? "error.main"
                : missingCount
                ? "warning.main"
                : "success.main",
              borderRadius: 1,
              p: 2,
            }}
          >
            <Stack spacing={1}>
              <Typography variant="subtitle1">Translations health</Typography>
              {healthError ? <Alert severity="error">Unable to load translation health.</Alert> : null}
              {healthLoading ? <Alert severity="info">Loading translation health...</Alert> : null}
              {!healthLoading && !healthError ? (
                <Alert severity={missingCount ? "warning" : "success"}>
                  Missing translations: {missingCount}
                </Alert>
              ) : null}
            </Stack>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Locale"
              value={locale}
              onChange={(event) => setLocale(event.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            >
              {SUPPORTED_LOCALES.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Filter keys"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              size="small"
              fullWidth
            />
          </Stack>

          {translationsError ? <Alert severity="error">Unable to load translations.</Alert> : null}
          {translationsLoading ? <Alert severity="info">Loading translations...</Alert> : null}

          <Stack spacing={2}>
            {Object.entries(groupedEntries)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([prefix, items]) => {
                const hasMissing = items.some((item) => missingByKey[item.key]?.length);
                return (
                  <Accordion
                    key={prefix}
                    sx={{
                      border: 1,
                      borderColor: hasMissing ? "error.main" : "divider",
                      "&:before": { display: "none" },
                    }}
                  >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {prefix} ({items.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {items.map((entry) => {
                        const missingLocales = missingByKey[entry.key] ?? [];
                        const hasMissingLocales = missingLocales.length > 0;

                        return (
                          <TextField
                            key={entry.key}
                            label={entry.key}
                            value={entry.value}
                            onChange={(event) => handleChange(entry.key, event.target.value)}
                            disabled={!canEdit}
                            error={hasMissingLocales}
                            helperText={hasMissingLocales ? `Missing: ${missingLocales.join(", ")}` : undefined}
                            size="small"
                            fullWidth
                          />
                        );
                      })}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>

          {saveError ? <Alert severity="error">{saveError}</Alert> : null}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleReset} disabled={!hasChanges || saving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!hasChanges || saving || !canEdit}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
