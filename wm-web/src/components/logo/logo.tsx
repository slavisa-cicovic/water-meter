import { forwardRef } from 'react';
//
import Image from "next/image";
// @mui
import { useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Box, { BoxProps } from '@mui/material/Box';
// routes
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {

    const theme = useTheme();

    const logoSrc = theme.palette.mode === "dark" ? "/logo/logo-dark.png" : "/logo/logo.png";

    const logo = (
      <Box sx={{ width: 80, height: 80, position: "relative", ...sx }}>
        <Image src={logoSrc} alt="Water Meter logo" fill sizes="80px" priority />
      </Box>
    );


    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
