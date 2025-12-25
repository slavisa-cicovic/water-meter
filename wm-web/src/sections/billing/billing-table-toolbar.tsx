import React, { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

export type IBillingTableFilterValue = string;

export type IBillingTableFilters = {
  accountId: string;
  meterId: string;
  status: string;
  review: string;
  createdStart: string;
  createdEnd: string;
};

type Props = {
  filters: IBillingTableFilters;
  onFilters: (name: string, value: IBillingTableFilterValue) => void;
};

export function BillingTableToolbar({ filters, onFilters }: Props) {
  const handleChange = useCallback(
    (name: keyof IBillingTableFilters) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters(name, event.target.value);
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
          label="Account ID"
          value={filters.accountId}
          onChange={handleChange('accountId')}
          sx={{ minWidth: 180 }}
        />
        <TextField label="Meter ID" value={filters.meterId} onChange={handleChange('meterId')} sx={{ minWidth: 160 }} />
        <TextField select label="Status" value={filters.status} onChange={handleChange('status')} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="draft">draft</MenuItem>
          <MenuItem value="confirmed">confirmed</MenuItem>
          <MenuItem value="issued">issued</MenuItem>
          <MenuItem value="paid">paid</MenuItem>
          <MenuItem value="void">void</MenuItem>
        </TextField>
        <TextField select label="Review" value={filters.review} onChange={handleChange('review')} sx={{ minWidth: 200 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="non_positive_consumption">invalid_reading</MenuItem>
          <MenuItem value="no_reading_current_month">no_reading</MenuItem>
          <MenuItem value="invalid_household_size">no_household_size</MenuItem>
          <MenuItem value="no_previous_reading">no_previous_reading</MenuItem>
        </TextField>
        <TextField
          label="Created from"
          type="date"
          value={filters.createdStart}
          onChange={handleChange('createdStart')}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label="Created to"
          type="date"
          value={filters.createdEnd}
          onChange={handleChange('createdEnd')}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
      </Stack>
    </Stack>
  );
}
