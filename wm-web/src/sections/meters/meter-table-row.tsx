import { TableRow, TableCell, Stack, IconButton, Tooltip, Chip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Meter } from 'src/types/meters';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

type Props = {
  row: Meter & { consumersCount?: number };
};

export function MeterTableRow({ row }: Props) {
  return (
    <TableRow hover>
      <TableCell sx={{ width: 220 }}>{row.serialNumber}</TableCell>
      <TableCell sx={{ width: 120 }}>{row.groupCode || '-'}</TableCell>
      <TableCell sx={{ minWidth: 420 }}>{row.address}</TableCell>
      <TableCell sx={{ width: 140 }}>{row.type}</TableCell>
      <TableCell sx={{ width: 120 }}>
        <Chip size="small" label={row.status} />
      </TableCell>
      <TableCell sx={{ width: 120 }}>{row.consumersCount ?? '-'}</TableCell>
      <TableCell sx={{ width: 160 }}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</TableCell>
      <TableCell align="right" sx={{ width: 140 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Tooltip title="Details">
            <IconButton size="small" component={RouterLink} href={paths.dashboard.meters.details(row.id)}>
              <Iconify icon="eva:eye-fill" width={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
