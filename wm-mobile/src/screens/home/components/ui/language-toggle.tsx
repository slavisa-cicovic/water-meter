import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text } from "react-native";

import { useTranslation } from "@src/hooks/use-translation";

type LanguageToggleProps = {
  value?: string;
  onChange?: (locale: string) => void;
  disabled?: boolean;
};

export default function LanguageToggle({ value, onChange, disabled = false }: LanguageToggleProps) {
  const { locale, locales, setLocale } = useTranslation();
  const currentValue = value ?? locale;
  const currentLabel = locales.find((option) => option.value === currentValue)?.label ?? currentValue;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={[styles.select, disabled && styles.selectDisabled]}
        onPress={() => {
          if (disabled) return;
          setOpen(true);
        }}
      >
        <Text style={styles.selectText}>{currentLabel}</Text>
        <Text style={styles.selectIcon}>v</Text>
      </Pressable>
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {locales.map((option) => {
              const active = option.value === currentValue;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.optionRow, active && styles.optionRowActive]}
                  onPress={() => {
                    if (value === undefined) {
                      setLocale(option.value);
                    }
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  select: {
    borderWidth: 1,
    borderColor: "#e1e6f3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  selectDisabled: {
    opacity: 0.6,
  },
  selectText: { color: "#1f2a44", fontSize: 12, fontWeight: "600" },
  selectIcon: { color: "#6b7aa6", fontSize: 12, fontWeight: "700", marginLeft: 8 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
  },
  optionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optionRowActive: {
    backgroundColor: "#e9edfb",
  },
  optionText: { color: "#1f2a44", fontSize: 14, fontWeight: "600" },
  optionTextActive: { color: "#1f2a44" },
});
