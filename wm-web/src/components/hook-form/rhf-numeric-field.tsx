import { forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';
// @mui
import TextField, { TextFieldProps } from '@mui/material/TextField';

type NumberFormatProps = {
    onChange: (event: number | undefined) => void;
    name: string;
    userLang: string;
    suffix?: string;
    decimalScale: number;
    maxValue?: number;
};

const NumericFormatCustom = forwardRef<NumericFormatProps, NumberFormatProps>(
    (props, ref) => {
        const { onChange, userLang, suffix, decimalScale, maxValue, ...other } = props;

        const conf = userLang === 'de' ? {
            thousandSeparator: ".",
            decimalSeparator: ",",
        } : {
            thousandSeparator: ",",
            decimalSeparator: ".",
        };

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                onValueChange={values => {
                    try {
                        onChange(values.floatValue || 0)
                    } catch (error) {
                        // console.error(error.message)
                    }
                }}
                decimalScale={decimalScale}
                fixedDecimalScale
                suffix={suffix || "€"}
                thousandSeparator={conf.thousandSeparator}
                decimalSeparator={conf.decimalSeparator}
                thousandsGroupStyle="thousand"
                valueIsNumericString
                isAllowed={(values) => {
                    const { floatValue } = values;
                    return floatValue === undefined || (maxValue === undefined || floatValue <= maxValue);
                }}
            />
        );
    },
);

type NumericProps = TextFieldProps & {
    name: string;
    userLang: string;
    suffix?: string;
    decimalScale?: number;
    maxValue?: number;
};

export default function RHFNumericField({ onChange, name, helperText, userLang, suffix, decimalScale, maxValue, ...other }: NumericProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    value={field.value}
                    error={!!error}
                    helperText={error ? error?.message : helperText}
                    InputProps={{
                        inputComponent: NumericFormatCustom as any,
                        inputProps: {
                            onChange: field.onChange,
                            userLang,
                            suffix,
                            decimalScale,
                            maxValue,
                            sx: {
                                textAlign: 'right',
                            }
                        },
                    }}
                    {...other}
                />
            )}
        />
    );
}
