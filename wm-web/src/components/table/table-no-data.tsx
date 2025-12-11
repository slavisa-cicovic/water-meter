// @mui
import { Theme, SxProps } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// locales
import {useLocales} from 'src/locales';
//
import EmptyContent from '../empty-content';

// ----------------------------------------------------------------------

type Props = {
  title?: string,
  notFound: boolean;
  sx?: SxProps<Theme>;
};

export default function TableNoData({ title, notFound, sx }: Props) {

  const{t} = useLocales()

  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12} sx={{ p: 0 }}>
          <EmptyContent
            filled
            title={title || t('noData')}
            sx={{
              py: 2,
              ...sx,
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
