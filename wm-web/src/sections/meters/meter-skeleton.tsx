import { Skeleton, TableCell, TableRow } from '@mui/material';

type Props = {
  columns: number[];
  sx?: any;
};

export function MeterTableSkeleton({ columns, sx }: Props) {
  return (
    <TableRow sx={sx}>
      {columns.map((width, idx) => (
        <TableCell key={idx} sx={{ width }}>
          <Skeleton variant="text" width="100%" />
        </TableCell>
      ))}
    </TableRow>
  );
}
