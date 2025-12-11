import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { isNaN } from 'lodash';
// mui
import { LocalizationProvider, DatePicker as MuiDatePicker, DatePickerProps } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// hooks
import { useLocales } from 'src/locales';

// ---------------------------------------------------------------------------------------------------------------------
type Props = {
  name: string;
  disabled?: boolean;
  mMinDate?: Date;
  mMaxDate?: Date;
} & Partial<DatePickerProps<'date'>>

// ---------------------------------------------------------------------------------------------------------------------
export default function RHFDatePicker({
                                        name,
                                        label,
                                        disabled,
                                        mMinDate,
                                        mMaxDate,
                                      }: Props) {
  const { control } = useFormContext();

  const { currentLang } = useLocales();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={currentLang.adapterLocale}
        >
          <MuiDatePicker
            {...field}
            minDate={mMinDate}
            maxDate={mMaxDate}
            disabled={disabled}
            label={label}
            format="dd.MM.yyyy"
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
              },
            }}
            onChange={(date) => {
              if (date instanceof Date && !isNaN(date.getTime())) {
                field.onChange(date);
              } else {
                field.onChange(null);
              }
            }}
          />
        </LocalizationProvider>
      )
      }
    />
  );
}
