'use client';

// @mui
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
// components
import { useGetNotifications } from 'src/api/notifications';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';

export function NotificationPopover() {
  const { t } = useLocales();
  const popover = usePopover();
  const { summary, notificationsLoading, notificationsError } = useGetNotifications();

  const buildBillingHref = (params: { status?: string; review?: string }) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.review) query.set('review', params.review);
    const suffix = query.toString();
    return suffix ? `${paths.dashboard.billing.root}?${suffix}` : paths.dashboard.billing.root;
  };

  const reviewFlags = summary?.reviewFlags ?? {};
  const formatCount = (value: number) => (value > 99 ? '99+' : String(value));
  const notificationItems = [
    ...(reviewFlags.invalid_reading
      ? [
          {
            id: 'review-invalid-reading',
            count: reviewFlags.invalid_reading,
            title: t('notifications.items.invalidReading', {
              countLabel: formatCount(reviewFlags.invalid_reading),
            }),
            href: buildBillingHref({ review: 'invalid_reading' }),
          },
        ]
      : []),
    ...(reviewFlags.no_reading
      ? [
          {
            id: 'review-no-reading',
            count: reviewFlags.no_reading,
            title: t('notifications.items.noReading', {
              countLabel: formatCount(reviewFlags.no_reading),
            }),
            href: buildBillingHref({ review: 'no_reading' }),
          },
        ]
      : []),
    ...(reviewFlags.no_previous_reading
      ? [
          {
            id: 'review-no-previous-reading',
            count: reviewFlags.no_previous_reading,
            title: t('notifications.items.noPreviousReading', {
              countLabel: formatCount(reviewFlags.no_previous_reading),
            }),
            href: buildBillingHref({ review: 'no_previous_reading' }),
          },
        ]
      : []),
    ...(reviewFlags.no_household_size
      ? [
          {
            id: 'review-no-household-size',
            count: reviewFlags.no_household_size,
            title: t('notifications.items.noHouseholdSize', {
              countLabel: formatCount(reviewFlags.no_household_size),
            }),
            href: buildBillingHref({ review: 'no_household_size' }),
          },
        ]
      : []),
    ...(summary?.draftInvoices
      ? [
          {
            id: 'draft-invoices',
            count: summary.draftInvoices,
            title: t('notifications.items.draftInvoices', {
              countLabel: formatCount(summary.draftInvoices),
            }),
            href: buildBillingHref({ status: 'draft', review: 'no_flags' }),
          },
        ]
      : []),
    ...(summary?.unreadMessages
      ? [
          {
            id: 'unread-messages',
            count: summary.unreadMessages,
            title: t('notifications.items.unreadMessages', {
              countLabel: formatCount(summary.unreadMessages),
            }),
            href: paths.dashboard.messages.root,
          },
        ]
      : []),
    ...(summary?.outOfScopeMessages
      ? [
          {
            id: 'out-of-scope-messages',
            count: summary.outOfScopeMessages,
            title: t('notifications.items.outOfScopeMessages', {
              countLabel: formatCount(summary.outOfScopeMessages),
            }),
            href: paths.dashboard.messages.root,
          },
        ]
      : []),
  ];

  const unreadCount = notificationItems.reduce((total, item) => total + item.count, 0);
  const badgeLabel = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <>
      <Badge badgeContent={badgeLabel} color="error" invisible={unreadCount === 0}>
        <IconButton
          onClick={popover.onOpen}
          aria-label={t('notifications.ariaLabel')}
          sx={{ width: 40, height: 40 }}
        >
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </IconButton>
      </Badge>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right" sx={{ width: 320 }}>
        <MenuList sx={{ p: 0.5 }}>
          <MenuItem disabled sx={{ py: 1.25, typography: 'subtitle2' }}>
            {t('notifications.title')}
          </MenuItem>

          {notificationsLoading && (
            <MenuItem disabled>
              <ListItemText primary={<Typography variant="body2">{t('notifications.loading')}</Typography>} />
            </MenuItem>
          )}

          {!notificationsLoading && notificationsError && (
            <MenuItem disabled>
              <ListItemText primary={<Typography variant="body2">{t('notifications.loadError')}</Typography>} />
            </MenuItem>
          )}

          {!notificationsLoading && !notificationsError && notificationItems.length === 0 && (
            <MenuItem disabled>
              <ListItemText primary={<Typography variant="body2">{t('notifications.empty')}</Typography>} />
            </MenuItem>
          )}

          {!notificationsLoading &&
            !notificationsError &&
            notificationItems.map((n) => (
              <MenuItem key={n.id} component={RouterLink} href={n.href} onClick={popover.onClose}>
                <ListItemText primary={<Typography variant="subtitle2">{n.title}</Typography>} />
              </MenuItem>
            ))}
        </MenuList>
      </CustomPopover>
    </>
  );
}
