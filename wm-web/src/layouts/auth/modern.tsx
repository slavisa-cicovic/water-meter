import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";

type Props = {
  children: React.ReactNode;
};

export default function AuthModernLayout({ children}: Props) {
  return (
    <Stack
      sx={{
        backgroundImage: "url(/assets/background/login-page.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <Stack
        sx={{
          m: "auto",
          width: "100%",
          alignItems: "center",
          px: { xs: 2, sm: 4 },
        }}
      >
        <Card
          sx={{
            width: 920,
            maxWidth: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {children}
        </Card>
      </Stack>
    </Stack>
  );
}
