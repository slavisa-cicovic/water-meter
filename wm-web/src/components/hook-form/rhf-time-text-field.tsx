import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField, { TextFieldProps } from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = Omit<TextFieldProps, 'type'> & {
  name: string;
};

export default function RHFTimeTextField({ name, helperText, ...other }: Props) {
  const { control } = useFormContext();

  const validateTimeFormat = (value: string) => {
    const timePattern = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timePattern.test(value) || 'Please enter a valid time in hh:mm format';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{ validate: validateTimeFormat }}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type="text"
          value={field.value || ''}
          onChange={(event) => field.onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          error={!!error}
          helperText={error ? error.message : helperText}
          InputProps={{
            ...other.InputProps,
            inputProps: {
              ...other.InputProps?.inputProps,
              maxLength: 5, // Limiting to hh:mm format length
              placeholder: 'hh:mm',
              inputMode: 'numeric',
              pattern: '^([01]?[0-9]|2[0-3]):([0-5][0-9])$',
            },
          }}
          {...other}
        />
      )}
    />
  );
}
