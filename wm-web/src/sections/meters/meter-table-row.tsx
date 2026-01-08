import { TableRow, TableCell, Stack, IconButton, Tooltip, Chip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Meter } from 'src/types/meters';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';

type Props = {
  row: Meter & { consumersCount?: number };
  showReviewColumn?: boolean;
};

export function MeterTableRow({ row, showReviewColumn = false }: Props) {
  const { t } = useLocales();
  const statusLabelMap: Record<string, string> = {
    active: t('meters.status.active'),
    inactive: t('meters.status.inactive'),
    removed: t('meters.status.removed'),
  };
  const typeLabelMap: Record<string, string> = {
    automatic: t('meters.type.automatic'),
    mechanical: t('meters.type.mechanical'),
  };

  return (
    <TableRow hover>
      <TableCell sx={{ width: 220 }}>{row.serialNumber}</TableCell>
      <TableCell sx={{ width: 120 }}>{row.groupCode || '-'}</TableCell>
      <TableCell sx={{ minWidth: 420 }}>{row.address}</TableCell>
      <TableCell sx={{ width: 140 }}>{typeLabelMap[row.type] ?? row.type}</TableCell>
      <TableCell sx={{ width: 120 }}>
        <Chip size="small" label={statusLabelMap[row.status] ?? row.status} />
      </TableCell>
      <TableCell sx={{ width: 120 }}>{row.consumersCount ?? '-'}</TableCell>
      <TableCell sx={{ width: 160 }}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</TableCell>
      {showReviewColumn ? (
        <TableCell sx={{ width: 120 }}>
          {row.needsBarcodeReview ? (
            <Chip size="small" color="warning" label={t('meters.table.review')} />
          ) : (
            '-'
          )}
        </TableCell>
      ) : null}
      <TableCell align="right" sx={{ width: 140 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Tooltip title={t('meters.actions.details')}>
            <IconButton size="small" component={RouterLink} href={paths.dashboard.meters.details(row.id)}>
              <Iconify icon="eva:eye-fill" width={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
