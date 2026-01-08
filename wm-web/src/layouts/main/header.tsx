'use client';

// @mui
import AppBar from '@mui/material/AppBar';
import Badge, { badgeClasses } from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
// theme
import { bgBlur } from 'src/theme/css';
// components
import pkg from 'package.json';
import Label from 'src/components/label';
import Logo from 'src/components/logo';
import { useTranslation } from 'react-i18next';
//
import { HEADER } from '../config-layout';
import { navConfig } from './config-navigation';
import NavDesktop from './nav/desktop';
//
import { LanguagePopover, LoginButton, SettingsButton } from '../_common';

// ----------------------------------------------------------------------

export default function Header() {
  const theme = useTheme();
  const { t } = useTranslation();

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  return (
    <AppBar>
      <Toolbar
        disableGutters
        sx={{
          transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(offsetTop && {
            ...bgBlur({
              color: theme.palette.background.default,
            }),
            height: {
              md: HEADER.H_DESKTOP_OFFSET,
            },
          }),
        }}
      >
        <Container sx={{ height: 1, display: 'flex', alignItems: 'center' }}>
          <Badge
            sx={{
              [`& .${badgeClasses.badge}`]: {
                top: 8,
                right: -16,
              },
            }}
            badgeContent={
              <Link href='paths.changelog' target="_blank" rel="noopener" underline="none" sx={{ mt: 2 }}>
                <Label color="info" sx={{ textTransform: 'unset', height: 22 }}>
                  v{pkg.version}
                </Label>
              </Link>
            }
          >
            <Logo />
          </Badge>

          <Box sx={{ flexGrow: 1 }} />

          <NavDesktop offsetTop={offsetTop} data={navConfig} />

          <Stack alignItems="center" direction={{ xs: 'row', md: 'row-reverse' }}>
            <Button variant="contained" target="_blank" rel="noopener" href='paths.minimalUI'>
              {t('header.actions.purchase')}
            </Button>
            <LoginButton />
            <SettingsButton
              sx={{
                ml: { xs: 1, md: 0 },
                mr: { md: 2 },
              }}
            />
            <LanguagePopover />
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
