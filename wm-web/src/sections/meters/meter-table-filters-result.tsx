import { Chip, Stack } from '@mui/material';
import { IMeterTableFilters, IMeterTableFilterValue } from './meter-table-toolbar';

type Props = {
  filters: IMeterTableFilters;
  onFilters: (name: string, value: IMeterTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: any;
};

export function MeterTableFiltersResult({ filters, onFilters, onResetFilters, results, sx }: Props) {
  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.search) {
    chips.push({ key: 'search', label: `Search: ${filters.search}`, onDelete: () => onFilters('search', '') });
  }

  if (filters.status) {
    chips.push({ key: 'status', label: `Status: ${filters.status}`, onDelete: () => onFilters('status', '') });
  }

  if (filters.groupCode) {
    chips.push({ key: 'groupCode', label: `Group: ${filters.groupCode}`, onDelete: () => onFilters('groupCode', '') });
  }

  if (filters.type) {
    chips.push({ key: 'type', label: `Type: ${filters.type}`, onDelete: () => onFilters('type', '') });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={`Results: ${results}`} variant="outlined" />
      <Chip label="Reset" color="primary" onClick={onResetFilters} />
    </Stack>
  );
}
