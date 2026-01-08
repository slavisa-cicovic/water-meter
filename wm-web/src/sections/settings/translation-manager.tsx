"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Tab,
  Tabs,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuthContext } from "src/auth/hooks";
import { PERMISSIONS } from "src/constants/permissions";
import { TranslationsApi, useGetTranslations } from "src/api/translations";
import { TranslationBundle, TranslationTarget } from "src/types/translations";
import { useLocales } from "src/locales";

const SUPPORTED_LOCALES = ["en", "sr-Latn", "sr-Cyrl"];
export default function TranslationManager() {
  const { t } = useLocales();
  const { user } = useAuthContext();
  const [target, setTarget] = useState<TranslationTarget>("mobile");
  const [locale, setLocale] = useState("en");
  const [filter, setFilter] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canEdit = user?.permissions?.includes(PERMISSIONS.TRANSLATIONS_UPDATE) ?? false;
  const targetOptions: Array<{ value: TranslationTarget; label: string }> = useMemo(
    () => [
      { value: "mobile", label: t("settings.translations.target.mobile") },
      { value: "web", label: t("settings.translations.target.web") },
    ],
    [t]
  );
  const { bundle, translationsLoading, translationsError, mutate } = useGetTranslations(locale, target);
  const {
    bundle: enBundle,
    translationsLoading: enLoading,
    translationsError: enError,
  } = useGetTranslations("en", target);
  const {
    bundle: srLatnBundle,
    translationsLoading: srLatnLoading,
    translationsError: srLatnError,
  } = useGetTranslations("sr-Latn", target);
  const {
    bundle: srCyrlBundle,
    translationsLoading: srCyrlLoading,
    translationsError: srCyrlError,
  } = useGetTranslations("sr-Cyrl", target);

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

  useEffect(() => {
    setDrafts({});
    setSaveError(null);
  }, [locale, target]);

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
      await TranslationsApi.updateTranslations({ locale, target, updates });
      await mutate();
      setDrafts({});
    } catch (error) {
      setSaveError(t("settings.translations.errors.updateFailed"));
    } finally {
      setSaving(false);
    }
  }, [bundle, canEdit, entries, locale, mutate, t]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">{t("settings.translations.title")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("settings.translations.subtitle")}
            </Typography>
          </Box>

          <Tabs
            value={target}
            onChange={(_, nextTarget) => setTarget(nextTarget)}
            variant="fullWidth"
          >
            {targetOptions.map((option) => (
              <Tab key={option.value} value={option.value} label={option.label} />
            ))}
          </Tabs>

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
              <Typography variant="subtitle1">{t("settings.translations.health.title")}</Typography>
              {healthError ? <Alert severity="error">{t("settings.translations.health.loadError")}</Alert> : null}
              {healthLoading ? <Alert severity="info">{t("settings.translations.health.loading")}</Alert> : null}
              {!healthLoading && !healthError ? (
                <Alert severity={missingCount ? "warning" : "success"}>
                  {t("settings.translations.health.missing", { count: missingCount })}
                </Alert>
              ) : null}
            </Stack>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label={t("settings.translations.locale")}
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
              label={t("settings.translations.filter")}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              size="small"
              fullWidth
            />
          </Stack>

          {translationsError ? <Alert severity="error">{t("settings.translations.errors.loadFailed")}</Alert> : null}
          {translationsLoading ? <Alert severity="info">{t("settings.translations.loading")}</Alert> : null}

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
                            helperText={
                              hasMissingLocales
                                ? t("settings.translations.missingLocales", { locales: missingLocales.join(", ") })
                                : undefined
                            }
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
              {t("settings.actions.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!hasChanges || saving || !canEdit}
            >
              {t("settings.actions.save")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
