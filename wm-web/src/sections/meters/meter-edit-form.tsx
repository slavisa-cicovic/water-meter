import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import { useGetInvoices } from 'src/api/billing';
import { Meter } from 'src/types/meters';

type Props = {
  currentMeter?: Meter;
};

export function MeterEditForm({ currentMeter }: Props) {
  const meterId = currentMeter?.id;
  const { invoices, invoicesLoading, invoicesEmpty } = useGetInvoices(meterId ? { meterId } : undefined);

  return (
    <Grid container spacing={3}>
      <Grid>
        <Card>
          <CardHeader title="Meter details" />
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2">Serial: {currentMeter?.serialNumber || '-'}</Typography>
              <Typography variant="body2">Group: {currentMeter?.groupCode || '-'}</Typography>
              <Typography variant="body2">Address: {currentMeter?.address || '-'}</Typography>
              <Typography variant="body2">Type: {currentMeter?.type || '-'}</Typography>
              <Typography variant="body2">Status: {currentMeter?.status || '-'}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid>
        <Card>
          <CardHeader title="Billing history" />
          <CardContent>
            {invoicesLoading && <Typography variant="body2">Loading invoices...</Typography>}
            {!invoicesLoading && invoicesEmpty && <Typography variant="body2">No invoices found.</Typography>}
            {!invoicesLoading && invoices && invoices.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell sx={{ width: 160 }}>
                          {invoice.periodStart?.slice(0, 10)} → {invoice.periodEnd?.slice(0, 10)}
                        </TableCell>
                        <TableCell sx={{ width: 120 }}>{invoice.totalAmount}</TableCell>
                        <TableCell sx={{ width: 120 }}>{invoice.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

