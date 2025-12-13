import { Button, Chip, Stack, TableCell, TableRow, Typography } from "@mui/material";
import { AccountRow, VerificationStatus } from "src/types/accounts";

type Props = {
    row: AccountRow;
    onVerify: (status: VerificationStatus) => void,
};

const statusColor: Record<VerificationStatus, 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    verified: 'success',
    rejected: 'error',
};

export default function AccountTableRow({
    row,
    onVerify
}: Props) {

    const {
        id,
        data,
        verificationStatus,
        type,
        createdAt
    } = row;

    
    return (
        <TableRow key={row.id}>
            <TableCell>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                        {data.firstName} {row.data.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {data.address}
                    </Typography>
                </Stack>
            </TableCell>
            <TableCell>{data.email}</TableCell>
            <TableCell sx={{ textTransform: 'capitalize' }}>{type}</TableCell>
            <TableCell>
                <Chip label={verificationStatus} color={statusColor[verificationStatus]} size="small" />
            </TableCell>
            <TableCell>{createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</TableCell>
            <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        disabled={row.verificationStatus === 'verified'}
                        onClick={() => onVerify('verified')}
                    >
                        Verify
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={row.verificationStatus === 'rejected'}
                        onClick={() => onVerify('rejected')}
                    >
                        Reject
                    </Button>
                </Stack>
            </TableCell>
        </TableRow>
    )
}