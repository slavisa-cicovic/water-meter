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
    const allowedAccountRoles = Array.isArray(user?.allowedAccountRoles)
        ? (user?.allowedAccountRoles as string[])
        : null;

    const typeOptions = useMemo(() => {
        const base: { value: string; label: string }[] = [{ value: '', label: 'All' }];
        if (!roles.length) return base;

        const allowed =
            allowedAccountRoles && allowedAccountRoles.length
                ? roles.filter((role) => allowedAccountRoles.includes(role.slug))
                : roles;

        const hasStaff = allowed.some((role) => role.slug === 'staff_field' || role.slug === 'staff_backoffice');
        const options = base.concat(hasStaff ? [{ value: 'staff', label: 'staff' }] : []);

        return options.concat(allowed.map((role) => ({ value: role.slug, label: role.slug })));
    }, [roles, allowedAccountRoles]);

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
                    placeholder='search'
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
                    label="Type"
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
                    label="Status"
                    value={filters.status}
                    onChange={handleFilterStatus}
                    sx={{ minWidth: 160 }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                </TextField>
            </Stack>
        </Stack>
    );
}
