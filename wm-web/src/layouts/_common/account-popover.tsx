'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
// @mui
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
// components
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
// auth / routes
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/routes/paths';

function getInitials(value: unknown) {
  if (typeof value !== 'string') return '';
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function AccountPopover() {
  const router = useRouter();
  const popover = usePopover();
  const { user, logout } = useAuthContext();

  const displayName =
    (typeof (user as any)?.firstName === 'string' && typeof (user as any)?.lastName === 'string'
      ? `${(user as any).firstName} ${(user as any).lastName}`
      : undefined) ||
    (typeof (user as any)?.email === 'string' ? (user as any).email : undefined) ||
    'Account';

  const handlePlaceholder = useCallback(
    (label: string) => {
      popover.onClose();
      console.info(`[AccountPopover] TODO: ${label}`);
    },
    [popover]
  );

  const handleLogout = useCallback(async () => {
    popover.onClose();
    await logout();
    router.push(paths.auth.login);
  }, [logout, popover, router]);

  return (
    <>
      <IconButton onClick={popover.onOpen} aria-label="account" sx={{ p: 0 }}>
        <Avatar sx={{ width: 36, height: 36 }}>
          {getInitials(displayName)}
        </Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right" sx={{ width: 220 }}>
        <MenuList sx={{ p: 0.5 }}>
          <MenuItem disabled sx={{ typography: 'subtitle2', py: 1.25 }}>
            <Typography variant="subtitle2" noWrap>
              {displayName}
            </Typography>
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem onClick={() => handlePlaceholder('Profile')}>
            <Iconify icon="solar:user-circle-bold-duotone" width={20} />
            Profile
          </MenuItem>

          <MenuItem onClick={() => handlePlaceholder('Contact support')}>
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={20} />
            Contact support
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:logout-2-bold-duotone" width={20} />
            Logout
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}

