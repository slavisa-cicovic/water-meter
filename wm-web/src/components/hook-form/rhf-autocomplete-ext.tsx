import React, { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
// @mui
import { SxProps, Theme } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Popper } from '@mui/material';

// ----------------------------------------------------------------------

type RHFAutocompleteProps = {
  name: string;
  label?: string;
  helperText?: string;
  options: { label: string; value: number; color?: string, disabled?: boolean }[];
  textTransform?: string;
  PaperPropsSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  onChange?: (event: React.SyntheticEvent, value: string, reason: string) => void;
};

export default function RHFAutocomplete({
                                          name,
                                          label,
                                          helperText,
                                          options,
                                          PaperPropsSx,
                                          textTransform,
                                          onChange,
                                          ...other
                                        }: RHFAutocompleteProps) {
  const { control } = useFormContext();

  const scrollRef = useRef(0);
  const listRef = useRef<HTMLUListElement | null>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          {...other}
          options={options}
          getOptionLabel={(option) => option.label || ''}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          value={options.find(option => option.value === field.value) || null}
          onChange={(_event, newValue) => {
            field.onChange(newValue ? newValue.value : null);
          }}
          onInputChange={onChange}
          renderOption={(props, option) => (
            <li
              {...props}
              key={option.value}
              style={{ pointerEvents: option.disabled ? 'none' : 'auto', opacity: option.disabled ? 0.5 : 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {option.color && (
                  <FiberManualRecordIcon sx={{ color: option.color, fontSize: 'medium' }} />
                )}
                <Tooltip enterDelay={500} title={option.label.length > 25 ? option.label : ''}>
                  <Typography variant="body2" noWrap>
                    {option.label.length > 25 ? `${option.label.substring(0, 20)}...` : option.label}
                  </Typography>
                </Tooltip>
              </Stack>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={!!error}
              helperText={error ? error?.message : helperText}
              sx={{ textTransform: textTransform || 'inherit' }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {params.InputProps.startAdornment}
                    {field.value && getColorForValue(field.value, options) && (
                      <FiberManualRecordIcon
                        sx={{ color: getColorForValue(field.value, options), fontSize: 'medium' }} />
                    )}
                  </Stack>
                ),
              }}
            />
          )}
          PopperComponent={(popperProps) => (
            <Popper {...popperProps} sx={PaperPropsSx} />
          )}
          ListboxProps={{
            ref: (node: HTMLUListElement) => {
              if (node) {
                listRef.current = node;
                node.scrollTop = scrollRef.current;
              }
            },
            onScroll: (e: React.UIEvent<HTMLUListElement>) => {
              scrollRef.current = e.currentTarget.scrollTop;
            }
          }}
        />
      )}
    />
  );
}

function getColorForValue(value: number | null, options: { label: string; value: number; color?: string }[]): string | undefined {
  const selectedOption = options.find(option => option.value === value);
  return selectedOption?.color;
}
