import { TableRow, TableCell, Stack, IconButton, Tooltip, Chip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Meter } from 'src/types/meters';

type Props = {
  row: Meter & { consumersCount?: number };
};

export function MeterTableRow({ row }: Props) {
  return (
    <TableRow hover>
      <TableCell sx={{ width: 220 }}>{row.serialNumber}</TableCell>
      <TableCell sx={{ width: 120 }}>{row.groupCode || '-'}</TableCell>
      <TableCell sx={{ minWidth: 420 }}>{row.address}</TableCell>
      <TableCell sx={{ width: 120 }}>
        <Chip size="small" label={row.status} />
      </TableCell>
      <TableCell sx={{ width: 120 }}>{row.consumersCount ?? '-'}</TableCell>
      <TableCell sx={{ width: 160 }}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</TableCell>
      <TableCell align="right" sx={{ width: 140 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Tooltip title="Edit (TBD)">
            <IconButton size="small" disabled>
              <Iconify icon="eva:edit-fill" width={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Details (TBD)">
            <IconButton size="small" disabled>
              <Iconify icon="eva:eye-fill" width={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
