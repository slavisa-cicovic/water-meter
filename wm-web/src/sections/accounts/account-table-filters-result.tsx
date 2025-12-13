// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
// types
import { IAccountTableFilters, IAccountTableFilterValue } from 'src/types/accounts';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IAccountTableFilters;
  onFilters: (name: string, value: IAccountTableFilterValue) => void;
  //
  onResetFilters: VoidFunction;
  //
  results: number;
};

export default function AccountTableFiltersResult({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}: Props) {

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
          Found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.name && (
          <Button size="small" variant="outlined" onClick={() => onFilters('name', '')}>
            Name: {filters.name}
          </Button>
        )}
        {filters.type && (
          <Button size="small" variant="outlined" onClick={() => onFilters('type', '')}>
            Type: {filters.type}
          </Button>
        )}
        {filters.status && (
          <Button size="small" variant="outlined" onClick={() => onFilters('status', '')}>
            Status: {filters.status}
          </Button>
        )}
        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}
