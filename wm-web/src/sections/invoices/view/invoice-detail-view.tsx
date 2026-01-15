'use client';

import { Alert, Card, CardContent, Container, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useGetInvoice } from 'src/api/billing';
import { useGetSettings } from 'src/api/settings';
import EmptyContent from 'src/components/empty-content';
import { useMemo } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { formatReadingValue } from 'src/utils/reading-format';
import { formatCurrencyValue } from 'src/utils/format-currency';
import { useLocales } from 'src/locales';

type Props = {
  id: string;
};

export function InvoiceDetailView({ id }: Props) {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { invoice, invoiceLoading, invoiceError } = useGetInvoice(id);
  const { settings: appSettings } = useGetSettings();
  const statusLabel = invoice ? t(`billing.status.${invoice.status}`, { defaultValue: invoice.status }) : '';

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
      <CustomBreadcrumbs
        heading={t('billing.invoice.title')}
        description={t('billing.invoice.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
          { name: id },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {invoiceError && <EmptyContent filled title={t('billing.invoice.loadError')} sx={{ py: 6 }} />}
      {invoiceLoading && <Alert severity="info">{t('billing.invoice.loading')}</Alert>}

      {invoice && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('billing.invoice.summary')}</Typography>
                <Typography variant="body2">
                  {t('billing.invoice.account')}: {invoice.accountId}
                </Typography>
                <Typography variant="body2">
                  {t('billing.invoice.meter')}: {invoice.meterId || '-'}
                </Typography>
                <Typography variant="body2">
                  {t('billing.invoice.period')}: {invoice.periodStart?.slice(0, 10)} → {invoice.periodEnd?.slice(0, 10)}
                </Typography>
                <Typography variant="body2">
                  {t('billing.invoice.consumption')}: {invoice.consumption}
                </Typography>
                <Typography variant="body2">
                  {t('billing.invoice.unitPrice')}: {formatCurrencyValue(invoice.unitPrice, appSettings?.currency)}
                </Typography>
                <Typography variant="body2">
                  {t('billing.invoice.subtotal')}: {formatCurrencyValue(invoice.subtotal, appSettings?.currency)}
                </Typography>
                <Typography variant="body2">
                  {t('billing.invoice.vat')}: {formatCurrencyValue(invoice.vatAmount, appSettings?.currency)}
                </Typography>
                <Typography variant="body2">
                  {t('billing.invoice.total')}: {formatCurrencyValue(invoice.totalAmount, appSettings?.currency)}
                </Typography>
                <Typography variant="body2">
                  {t('billing.invoice.status')}: {statusLabel}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                {t('billing.invoice.lineItems')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {(invoice.lines || []).map((line: any) => (
                      <TableRow key={line.id}>
                        <TableCell sx={{ width: 160 }}>{line.type}</TableCell>
                        <TableCell>{line.description || '-'}</TableCell>
                        <TableCell sx={{ width: 120 }}>{line.quantity ?? '-'}</TableCell>
                        <TableCell sx={{ width: 120 }}>
                          {formatCurrencyValue(line.unitPrice, appSettings?.currency)}
                        </TableCell>
                        <TableCell sx={{ width: 120 }}>
                          {formatCurrencyValue(line.amount, appSettings?.currency)}
                        </TableCell>
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
                {t('billing.invoice.readings')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {readings.map((reading: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ width: 120 }}>{reading.role}</TableCell>
                        <TableCell sx={{ width: 160 }}>{reading.readAt?.slice?.(0, 10) || '-'}</TableCell>
                        <TableCell>{formatReadingValue(reading.value)}</TableCell>
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
                {t('billing.invoice.tariffSnapshot')}
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
