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

  const renderSkeleton = <AccountDetailsSkeleton />;

  const renderError = (
    <EmptyContent
      filled
      title={`Error, not found ${id}`}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.accounts.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16}/>}
          sx={{mt: 3}}
        >
          Back
        </Button>
      }
      sx={{py: 10}}
    />
  );

  const accountName = currentAccount
    ? `${currentAccount.data.firstName} ${currentAccount.data.lastName}`
    : `Account ${id}`;
  const description =
    currentAccount?.type === 'consumer'
      ? 'Billing history and profile.'
      : currentAccount?.type === 'staff_field'
      ? 'Readings history and profile.'
      : 'Account profile.';

  const renderAccount = currentAccount && (
      <AccountEditForm currentAccount={currentAccount}/>
  )

  return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={accountName}
          description={description}
        links={[
          { name: 'App', href: paths.dashboard.root },
          { name: 'Accounts', href: paths.dashboard.accounts.root },
          { name: 'Details' },
        ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        {accountLoading && renderSkeleton}
        {accountError && renderError}
        {currentAccount && renderAccount}
      </Container>
  );
}
