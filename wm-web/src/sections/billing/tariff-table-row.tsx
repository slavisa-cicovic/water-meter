import { TableRow, TableCell, Stack, IconButton, Tooltip, Checkbox, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Tariff } from 'src/types/billings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

type Props = {
  row: Tariff;
  selected?: boolean;
  onSelectRow?: VoidFunction;
  selectable?: boolean;
};

const toDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function TariffTableRow({ row, selected, onSelectRow, selectable = true }: Props) {
  const isActive = row.status !== 'inactive';
  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox checked={!!selected} onChange={onSelectRow} disabled={!selectable} />
      </TableCell>
      <TableCell sx={{ minWidth: 200 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">{row.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {row.groupCode || '-'}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ width: 120 }}>{row.basePrice}</TableCell>
      <TableCell sx={{ width: 160 }}>
        {row.greenLimit} / {row.blueLimit}
      </TableCell>
      <TableCell sx={{ width: 160 }}>
        {row.blueMultiplier} / {row.redMultiplier}
      </TableCell>
      <TableCell sx={{ width: 120 }}>{toDate(row.validFrom)}</TableCell>
      <TableCell sx={{ width: 120 }}>{row.validTo ? toDate(row.validTo) : '-'}</TableCell>
      <TableCell sx={{ width: 80 }}>
        <Tooltip title={isActive ? 'Active' : 'Inactive'}>
          <span>
            <Iconify
              icon={isActive ? 'eva:checkmark-circle-2-fill' : 'eva:slash-outline'}
              width={18}
              sx={{ color: isActive ? 'success.main' : 'text.secondary' }}
            />
          </span>
        </Tooltip>
      </TableCell>
      <TableCell align="right" sx={{ width: 80 }}>
        <Tooltip title="Tariff detail">
          <IconButton size="small" component={RouterLink} href={paths.dashboard.billing.tariffs.details(row.id)}>
            <Iconify icon="eva:eye-fill" width={16} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
