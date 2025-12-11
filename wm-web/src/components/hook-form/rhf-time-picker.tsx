import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { isNaN } from 'lodash';
// mui
import { TimePicker, TimePickerProps } from '@mui/x-date-pickers/TimePicker';

// ----------------------------------------------------------------------

type Props = {
  name: string;
  disabled?: boolean;
  defaultDate?: Date;
} & Partial<TimePickerProps<'time'>>;

export default function RHFTimePicker({
                                        name,
                                        label,
                                        disabled,
                                        defaultDate,
                                      }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TimePicker
          {...field}
          label={label}
          ampm={false}
          disabled={disabled}
          views={['hours', 'minutes']}
          slotProps={{
            textField: {
              fullWidth: false,
              error: !!error,
              helperText: error?.message,
            },
          }}
          onChange={(time) => {
            if (time instanceof Date && !isNaN(time.getTime())) {
              const finalDate = new Date(
                defaultDate?.getFullYear() ?? time.getFullYear(),
                defaultDate?.getMonth() ?? time.getMonth(),
                defaultDate?.getDate() ?? time.getDate(),
                time.getHours(),
                time.getMinutes()
              );
              field.onChange(finalDate);
            } else {
              field.onChange(null);
            }
          }}
          sx={{ minWidth: 100 }}
        />
      )}
    />
  );
}
