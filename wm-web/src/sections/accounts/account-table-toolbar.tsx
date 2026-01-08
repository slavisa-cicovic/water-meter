import React, { useCallback, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
import { useGetRoles } from 'src/api/roles';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
// types
import { IAccountTableFilters, IAccountTableFilterValue } from 'src/types/accounts';

// ----------------------------------------------------------------------

type Props = {
    filters: IAccountTableFilters;
    onFilters: (name: string, value: IAccountTableFilterValue) => void;  //

};

export default function AccountTableToolbar({
    filters,
    onFilters,
}: Props) {
    const { user } = useAuthContext();
    const { roles } = useGetRoles();
    const { t } = useLocales();
    const allowedAccountRoles = Array.isArray(user?.allowedAccountRoles)
        ? (user?.allowedAccountRoles as string[])
        : null;

    const typeLabels = useMemo(
        () => ({
            consumer: t('accounts.type.consumer'),
            staff: t('accounts.type.staff'),
            staff_field: t('accounts.type.staffField'),
            staff_backoffice: t('accounts.type.staffBackoffice'),
        }),
        [t]
    );

    const typeOptions = useMemo(() => {
        const base: { value: string; label: string }[] = [{ value: '', label: t('accounts.filters.all') }];
        if (!roles.length) return base;

        const allowed =
            allowedAccountRoles && allowedAccountRoles.length
                ? roles.filter((role) => allowedAccountRoles.includes(role.slug))
                : roles;

        const hasStaff = allowed.some((role) => role.slug === 'staff_field' || role.slug === 'staff_backoffice');
        const options = base.concat(hasStaff ? [{ value: 'staff', label: typeLabels.staff }] : []);

        return options.concat(
            allowed.map((role) => ({
                value: role.slug,
                label: typeLabels[role.slug] ?? role.slug,
            }))
        );
    }, [roles, allowedAccountRoles, t, typeLabels]);

    const handleFilterName = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onFilters('name', event.target.value);
        },
        [onFilters]
    );

    const handleFilterType = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onFilters('type', event.target.value);
        },
        [onFilters]
    );

    const handleFilterStatus = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onFilters('status', event.target.value);
        },
        [onFilters]
    );

    return (

        <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{
                xs: 'column',
                md: 'row',
            }}
            sx={{
                p: 2.5,
                pr: { xs: 2.5, md: 2.5 },
            }}
        >

            <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
                <TextField
                    fullWidth
                    value={filters.name}
                    onChange={handleFilterName}
                    placeholder={t('accounts.filters.searchPlaceholder')}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    select
                    label={t('accounts.filters.typeLabel')}
                    value={filters.type}
                    onChange={handleFilterType}
                    sx={{ minWidth: 160 }}
                >
                    {typeOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label={t('accounts.filters.statusLabel')}
                    value={filters.status}
                    onChange={handleFilterStatus}
                    sx={{ minWidth: 160 }}
                >
                    <MenuItem value="">{t('accounts.filters.all')}</MenuItem>
                    <MenuItem value="pending">{t('accounts.status.pending')}</MenuItem>
                    <MenuItem value="verified">{t('accounts.status.verified')}</MenuItem>
                    <MenuItem value="rejected">{t('accounts.status.rejected')}</MenuItem>
                </TextField>
            </Stack>
        </Stack>
    );
}
