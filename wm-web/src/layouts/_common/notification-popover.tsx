'use client';

// @mui
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
// components
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';

const mockNotifications = [
  { id: 'n1', title: 'New reading submitted', description: 'A meter reading was submitted.' },
  { id: 'n2', title: 'Account pending verification', description: 'A new account awaits review.' },
];

export function NotificationPopover() {
  const popover = usePopover();
  const unreadCount = mockNotifications.length;

  return (
    <>
      <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
        <IconButton onClick={popover.onOpen} aria-label="notifications" sx={{ width: 40, height: 40 }}>
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </IconButton>
      </Badge>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right" sx={{ width: 320 }}>
        <MenuList sx={{ p: 0.5 }}>
          <MenuItem disabled sx={{ py: 1.25, typography: 'subtitle2' }}>
            Notifications
          </MenuItem>

          {mockNotifications.map((n) => (
            <MenuItem key={n.id} onClick={popover.onClose}>
              <ListItemText
                primary={<Typography variant="subtitle2">{n.title}</Typography>}
                secondary={
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {n.description}
                  </Typography>
                }
              />
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </>
  );
}

