"use client";

import { useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";

import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import Logo from "src/components/logo";
import { useAuthContext } from "src/auth/hooks";
import { paths } from "src/routes/paths";

export default function LoginView() {
    type LoginFormValues = {
        identifier: string;
        password: string;
        remember: boolean;
    };

    const schema: Yup.ObjectSchema<LoginFormValues> = Yup.object({
        identifier: Yup.string().required("Email or username is required"),
        password: Yup.string().required("Password is required"),
        remember: Yup.boolean().required().default(false),
    }).required();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
        mode: "onBlur",
        resolver: yupResolver(schema),
        defaultValues: {
            identifier: "",
            password: "",
            remember: false,
        },
  });

  const { login } = useAuthContext();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setFormError(null);
    try {
      await login?.(values.identifier, values.password, values.remember);
      router.push(paths.dashboard.root);
    } catch (error: any) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || "Unable to sign in. Please check your credentials.";
      setFormError(message);
    }
  };

    return (
        <CardContent>
            <Stack direction='row' sx={{ p: 2 }}>
                <Logo sx={{ my: 'auto', width: 180, height: 180 }} />
                <Stack sx={{ width: '75%' }}>
                    <Stack spacing={2} sx={{ mb: 2 }}>
                        <Typography variant="h4">Sign in</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Access your dashboard to manage accounts, readings, and billing.
                        </Typography>
                    </Stack>

                    <Stack
                        spacing={2.5}
                        component="form"
                        noValidate
                        onSubmit={handleSubmit(onSubmit)}
      >
        {formError && (
          <Typography variant="body2" color="error">
            {formError}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Email or Username"
                            autoComplete="username"
                            type="text"
                            error={Boolean(errors.identifier)}
                            helperText={errors.identifier?.message}
                            {...register("identifier")}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            error={Boolean(errors.password)}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            helperText={errors.password?.message}
                            {...register("password")}
                        />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Button
                                component={Link}
                                href="/auth/forgot-password"
                                variant="text"
                                size="small"
                            >
                                Forgot password?
                            </Button>
                            <Button
                                component={Link}
                                href="/auth/register"
                                variant="text"
                                size="small"
                            >
                                Create account
                            </Button>
                        </Stack>

                        <FormControlLabel
                            control={<Checkbox size="small" {...register("remember")} />}
                            label="Remember me"
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            Login
                        </Button>
                    </Stack>
                </Stack>

            </Stack>
        </CardContent>
    );
}
