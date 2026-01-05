import React, { useCallback, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
import { useGetRoles } from 'src/api/roles';
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
    const { roles } = useGetRoles();

    const typeOptions = useMemo(() => {
        const base = [{ value: '', label: 'All' }, { value: 'staff', label: 'staff' }];
        if (!roles.length) return base;
        return base.concat(
            roles.map((role) => ({ value: role.slug, label: role.slug }))
        );
    }, [roles]);

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
