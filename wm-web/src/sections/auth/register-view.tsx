"use client";

import { useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
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

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

const schema: Yup.ObjectSchema<RegisterFormValues> = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
  acceptTerms: Yup.boolean().oneOf([true], "You must accept the terms").required(),
}).required();

export default function RegisterView() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    // TODO: wire to registration API/service
    console.log("register submit", values);
  };

  return (
    <CardContent>
      <Stack direction="row" sx={{ p: 2 }}>
        <Logo sx={{ my: "auto", width: 180, height: 180 }} />
        <Stack
          sx={{
            width: "75%",
          }}
        >
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h4">Create account</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Join Water Meter to manage readings and billing for your properties.
            </Typography>
          </Stack>

          <Stack
            spacing={2.5}
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="First name"
                autoComplete="given-name"
                error={Boolean(errors.firstName)}
                helperText={errors.firstName?.message}
                {...register("firstName")}
              />
              <TextField
                fullWidth
                label="Last name"
                autoComplete="family-name"
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message}
                {...register("lastName")}
              />
            </Stack>

            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register("email")}
            />

            <TextField
              fullWidth
              label="Username"
              autoComplete="username"
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              {...register("username")}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

            <TextField
              fullWidth
              label="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              error={Boolean(errors.confirmPassword)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              helperText={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <FormControlLabel
              control={<Checkbox size="small" {...register("acceptTerms")} />}
              label="I agree to the terms and privacy policy"
            />
            {errors.acceptTerms?.message && (
              <Typography variant="caption" color="error">
                {errors.acceptTerms.message}
              </Typography>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                component={Link}
                href="/auth/forgot-password"
                variant="text"
                size="small"
              >
                Forgot password?
              </Button>
              <Button component={Link} href="/auth/login" variant="text" size="small">
                Already have an account? Sign in
              </Button>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={isSubmitting}
            >
              Create account
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </CardContent>
  );
}
