// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// components

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthModernLayout({ children }: Props) {


  return (
    <Stack
      sx={{
        backgroundImage: 'url(/assets/background/login-page.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      <Stack sx={{
        m: 'auto',
      }}>
        <Card
          sx={{
            mt: 12,
            ml: 4,
            width: 920,
            height: 460,
          }}
        >
          {children}
        </Card>
      </Stack>
    </Stack>
  );
}
