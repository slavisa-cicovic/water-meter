import React, { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { MeterStatus } from 'src/types/meters';

export type IMeterTableFilterValue = string;

export type IMeterTableFilters = {
  search: string;
  status: '' | MeterStatus;
  groupCode: string;
};

type Props = {
  filters: IMeterTableFilters;
  onFilters: (name: string, value: IMeterTableFilterValue) => void;
};

export function MeterTableToolbar({ filters, onFilters }: Props) {
  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('search', event.target.value);
    },
    [onFilters]
  );

  const handleStatus = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );

  const handleGroupCode = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('groupCode', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 2.5 } }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.search}
          onChange={handleSearch}
          placeholder="search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField select label="Status" value={filters.status} onChange={handleStatus} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">active</MenuItem>
          <MenuItem value="inactive">inactive</MenuItem>
          <MenuItem value="removed">removed</MenuItem>
        </TextField>

        <TextField
          label="Group"
          value={filters.groupCode}
          onChange={handleGroupCode}
          placeholder="01-99"
          sx={{ minWidth: 160 }}
        />
      </Stack>
    </Stack>
  );
}
