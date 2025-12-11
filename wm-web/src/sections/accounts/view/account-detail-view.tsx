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
//
import { AccountDetailsSkeleton } from '../account-skeleton';
import AccountEditForm from '../account-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function DomainEditView({id}: Props) {

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

  const renderAccount = currentAccount && (
      <AccountEditForm currentAccount={currentAccount}/>
  )

  return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        {accountLoading && renderSkeleton}
        {accountError && renderError}
        {currentAccount && renderAccount}
      </Container>
  );
}
