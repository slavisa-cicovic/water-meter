import React from "react";
import {useFormContext, Controller} from 'react-hook-form';
// 3rd party
import {MuiColorInput, MuiColorInputProps} from "mui-color-input";

// ----------------------------------------------------------------------

type Props = {
    name: string;
} & Partial<MuiColorInputProps>

export default function RHFColorInput({name, helperText, ...other}: Props) {
    const {control} = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({field, fieldState: {error}}) => (
                <MuiColorInput
                    {...field}
                    format="hex8"
                    error={!!error}
                    helperText={error ? error?.message : helperText}
                    {...other}
                />
            )}
        />
    );
}

