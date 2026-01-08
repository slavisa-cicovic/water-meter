import { Avatar, Button, Chip, Stack, TableCell, TableRow, Typography, IconButton, Tooltip } from "@mui/material";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";
import { useAuthContext } from "src/auth/hooks";
import Iconify from "src/components/iconify";
import { PERMISSIONS } from "src/constants/permissions";
import { AccountRow, VerificationStatus } from "src/types/accounts";
import { useLocales } from "src/locales";

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
    const { user } = useAuthContext();
    const { t } = useLocales();
    const currentPermissions = (user as any)?.permissions as string[] | undefined;
    const canViewDetails = currentPermissions?.includes(PERMISSIONS.ACCOUNTS_READ) ?? false;

    const {
        id,
        data,
        verificationStatus,
        type,
        createdAt
    } = row;

    const initials = `${data.firstName?.[0] ?? ''}${data.lastName?.[0] ?? ''}`.toUpperCase();
    const avatarSrc = type !== 'consumer' ? row.avatar : undefined;
    const typeLabelMap: Record<string, string> = {
        consumer: t('accounts.type.consumer'),
        staff_field: t('accounts.type.staffField'),
        staff_backoffice: t('accounts.type.staffBackoffice'),
    };
    const statusLabelMap: Record<VerificationStatus, string> = {
        pending: t('accounts.status.pending'),
        verified: t('accounts.status.verified'),
        rejected: t('accounts.status.rejected'),
    };
    
    return (
        <TableRow key={row.id}>
            <TableCell sx={{ width: 72 }}>
                <Avatar src={avatarSrc || undefined} alt={`${data.firstName} ${data.lastName}`} sx={{ width: 32, height: 32 }}>
                    {initials}
                </Avatar>
            </TableCell>
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
            <TableCell sx={{ textTransform: 'capitalize' }}>{typeLabelMap[type] ?? type}</TableCell>
            <TableCell>
                <Chip
                    label={statusLabelMap[verificationStatus]}
                    color={statusColor[verificationStatus]}
                    size="small"
                />
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
                        {t('accounts.actions.verify')}
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={row.verificationStatus === 'rejected'}
                        onClick={() => onVerify('rejected')}
                    >
                        {t('accounts.actions.reject')}
                    </Button>
                    {canViewDetails ? (
                        <Tooltip title={t('accounts.actions.details')}>
                            <IconButton
                                size="small"
                                component={RouterLink}
                                href={paths.dashboard.accounts.details(id)}
                            >
                                <Iconify icon="eva:eye-fill" width={16} />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <IconButton size="small" disabled sx={{ opacity: 0, pointerEvents: 'none' }}>
                            <Iconify icon="eva:eye-fill" width={16} />
                        </IconButton>
                    )}
                </Stack>
            </TableCell>
        </TableRow>
    )
}
