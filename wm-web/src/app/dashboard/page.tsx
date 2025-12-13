import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h4">Welcome to Water Meter</Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              This dashboard is intentionally lightweight for fast loading. Use the navigation to
              access accounts, readings, and billing features.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
