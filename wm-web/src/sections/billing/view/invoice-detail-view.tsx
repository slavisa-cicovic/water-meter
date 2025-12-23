'use client';

import { Alert, Card, CardContent, Container, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useGetInvoice } from 'src/api/billing';
import EmptyContent from 'src/components/empty-content';
import { useMemo } from 'react';

type Props = {
  id: string;
};

export function InvoiceDetailView({ id }: Props) {
  const settings = useSettingsContext();
  const { invoice, invoiceLoading, invoiceError } = useGetInvoice(id);

  const readings = useMemo(() => {
    const links = (invoice as any)?.readings || [];
    return links.map((link: any) => ({
      role: link.role,
      value: link.reading?.value,
      readAt: link.reading?.readAt,
    }));
  }, [invoice]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack spacing={2} mb={3}>
        <Typography variant="h4">Invoice Detail</Typography>
        <Typography variant="body2" color="text.secondary">
          Detailed invoice with readings, tariff snapshot, and line items.
        </Typography>
      </Stack>

      {invoiceError && <EmptyContent filled title="Failed to load invoice." sx={{ py: 6 }} />}
      {invoiceLoading && <Alert severity="info">Loading invoice...</Alert>}

      {invoice && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Summary</Typography>
                <Typography variant="body2">Account: {invoice.accountId}</Typography>
                <Typography variant="body2">Meter: {invoice.meterId || '-'}</Typography>
                <Typography variant="body2">
                  Period: {invoice.periodStart?.slice(0, 10)} → {invoice.periodEnd?.slice(0, 10)}
                </Typography>
                <Typography variant="body2">Consumption: {invoice.consumption}</Typography>
                <Typography variant="body2">Unit price: {invoice.unitPrice}</Typography>
                <Typography variant="body2">Subtotal: {invoice.subtotal}</Typography>
                <Typography variant="body2">VAT: {invoice.vatAmount}</Typography>
                <Typography variant="body2">Total: {invoice.totalAmount}</Typography>
                <Typography variant="body2">Status: {invoice.status}</Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Line items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {(invoice.lines || []).map((line: any) => (
                      <TableRow key={line.id}>
                        <TableCell sx={{ width: 160 }}>{line.type}</TableCell>
                        <TableCell>{line.description || '-'}</TableCell>
                        <TableCell sx={{ width: 120 }}>{line.quantity ?? '-'}</TableCell>
                        <TableCell sx={{ width: 120 }}>{line.unitPrice ?? '-'}</TableCell>
                        <TableCell sx={{ width: 120 }}>{line.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Readings
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {readings.map((reading: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ width: 120 }}>{reading.role}</TableCell>
                        <TableCell sx={{ width: 160 }}>{reading.readAt?.slice?.(0, 10) || '-'}</TableCell>
                        <TableCell>{reading.value ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Tariff snapshot
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {Object.entries(invoice.tariffSnapshot || {}).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ width: 200 }}>{key}</TableCell>
                        <TableCell>{String(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Container>
  );
}

