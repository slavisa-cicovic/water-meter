'use client';

// @mui
import Container from '@mui/material/Container';
import Button from "@mui/material/Button";
// routes
import {paths} from 'src/routes/paths';
import {RouterLink} from "src/routes/components";
// api
import {useGetAccount} from "src/api/accounts";
// locales
import {useLocales} from 'src/locales';
// components
import {useSettingsContext} from 'src/components/settings';
import EmptyContent from "src/components/empty-content";
import Iconify from "src/components/iconify";
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PermissionDenied from 'src/components/permission-denied';
//
import { AccountDetailsSkeleton } from '../account-skeleton';
import AccountEditForm from '../account-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function AccountEditView({id}: Props) {

  const {t} = useLocales();

  const settings = useSettingsContext();


  const {account: currentAccount, accountLoading, accountError} = useGetAccount(id);
  const forbidden = (accountError as { error?: string } | undefined)?.error === 'FORBIDDEN';

  const renderSkeleton = <AccountDetailsSkeleton />;

  const renderError = (
    <EmptyContent
      filled
      title={t('accounts.detail.notFound', { id })}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.accounts.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16}/>}
          sx={{mt: 3}}
        >
          {t('accounts.actions.back')}
        </Button>
      }
      sx={{py: 10}}
    />
  );

  const accountName = currentAccount
    ? `${currentAccount.data.firstName} ${currentAccount.data.lastName}`
    : t('accounts.detail.titleFallback', { id });
  const description =
    currentAccount?.type === 'consumer'
      ? t('accounts.detail.description.consumer')
      : currentAccount?.type === 'staff_field'
      ? t('accounts.detail.description.staffField')
      : t('accounts.detail.description.default');

  const renderAccount = currentAccount && (
      <AccountEditForm currentAccount={currentAccount}/>
  )

  return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        {!forbidden && (
          <CustomBreadcrumbs
            heading={accountName}
            description={description}
            links={[
              { name: t('sidebar.app'), href: paths.dashboard.root },
              { name: t('accounts.title'), href: paths.dashboard.accounts.root },
              { name: t('accounts.detail.breadcrumbs.details') },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />
        )}
        {accountLoading && renderSkeleton}
        {forbidden && <PermissionDenied sx={{ py: 6 }} illustrationSx={{ my: 6 }} />}
        {accountError && !forbidden && renderError}
        {currentAccount && renderAccount}
      </Container>
  );
}
