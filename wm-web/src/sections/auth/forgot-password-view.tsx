"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";

import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import Logo from "src/components/logo";

type ForgotFormValues = {
  identifier: string;
};

const schema: Yup.ObjectSchema<ForgotFormValues> = Yup.object({
  identifier: Yup.string().required("Email or username is required"),
}).required();

export default function ForgotPasswordView() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotFormValues> = async (values) => {
    // TODO: wire to forgot-password API/service and show success state
    console.log("forgot-password submit", values);
  };

  return (
    <CardContent>
      <Stack direction="row" sx={{ p: 2 }}>
        <Logo sx={{ my: "auto", width: 180, height: 180 }} />
        <Stack sx={{ width: "75%" }}>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h4">Forgot password</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Enter your email or username and we will send you a reset link.
            </Typography>
          </Stack>

          <Stack
            spacing={2.5}
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextField
              fullWidth
              label="Email or Username"
              autoComplete="username"
              type="text"
              error={Boolean(errors.identifier)}
              helperText={errors.identifier?.message}
              {...register("identifier")}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button component={Link} href="/auth/login" variant="text" size="small">
                Back to login
              </Button>
              <Button component={Link} href="/auth/register" variant="text" size="small">
                Create account
              </Button>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={isSubmitting}
            >
              Send reset link
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </CardContent>
  );
}
