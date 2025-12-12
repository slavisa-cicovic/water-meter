"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export default function LoginView() {
    return (
        <CardContent >
            <Stack spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h4">Sign in</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Access your dashboard to manage accounts, readings, and billing.
                </Typography>
            </Stack>

            <Stack spacing={2.5}>
                <TextField fullWidth label="Email or Username" type="email" />
                <TextField fullWidth label="Password" type="password" />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button href="/auth/forgot-password" variant="text" size="small">
                        Forgot password?
                    </Button>
                    <Button href="/auth/register" variant="text" size="small">
                        Create account
                    </Button>
                </Stack>

                <Button fullWidth variant="contained" size="large">
                    Login
                </Button>
            </Stack>
        </CardContent>
    );
}
