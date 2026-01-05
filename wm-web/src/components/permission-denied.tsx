'use client';

import { m } from 'framer-motion';
import { Theme, SxProps } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ForbiddenIllustration } from 'src/assets/illustrations';
import { MotionContainer, varBounce } from 'src/components/animate';

type Props = {
  title?: string;
  message?: string;
  sx?: SxProps<Theme>;
  illustrationSx?: SxProps<Theme>;
};

export default function PermissionDenied({
  title = 'Permission Denied',
  message = 'You do not have permission to access this page',
  sx,
  illustrationSx,
}: Props) {
  return (
    <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
      <m.div variants={varBounce().in}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {title}
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <Typography sx={{ color: 'text.secondary' }}>{message}</Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <ForbiddenIllustration
          sx={{
            height: 260,
            my: 10,
            ...(illustrationSx || {}),
          }}
        />
      </m.div>
    </Container>
  );
}
