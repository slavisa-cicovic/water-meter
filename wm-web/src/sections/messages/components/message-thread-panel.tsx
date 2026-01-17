'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSWRConfig } from 'swr';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useLocales } from 'src/locales';
import { MessageItem } from 'src/types/messages';
import { MessagesApi, useGetMessageThread } from 'src/api/messages';

type Props = {
  accountId?: string | null;
  compact?: boolean;
};

const mergeMessages = (base: MessageItem[], extra: MessageItem[]) => {
  const map = new Map(base.map((item) => [item.id, item]));
  extra.forEach((item) => map.set(item.id, item));
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

export default function MessageThreadPanel({ accountId, compact }: Props) {
  const { t } = useLocales();
  const { mutate: mutateCache } = useSWRConfig();
  const { thread, threadLoading, threadError, mutate: mutateThread } = useGetMessageThread(accountId);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<MessageItem[]>([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPendingValue, setAiPendingValue] = useState<boolean | null>(null);
  const [aiSaving, setAiSaving] = useState(false);

  useEffect(() => {
    setHistory([]);
    setMessage('');
  }, [accountId]);

  const mergedMessages = useMemo(
    () => mergeMessages(thread?.messages ?? [], history),
    [thread?.messages, history]
  );

  const handleLoadOlder = async () => {
    if (!accountId || loadingOlder || mergedMessages.length === 0) return;
    const oldest = mergedMessages[0]?.createdAt;
    if (!oldest) return;
    setLoadingOlder(true);
    try {
      const res = await axiosInstance.get(endpoints.messages.root, {
        params: { accountId, before: oldest, limit: 30 },
      });
      const older = (res.data?.messages as MessageItem[]) ?? [];
      if (older.length) {
        setHistory((prev) => mergeMessages(prev, older));
      }
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSend = async () => {
    const body = message.trim();
    if (!body || !accountId || sending) return;
    setSending(true);
    try {
      await MessagesApi.sendMessage(accountId, body);
      setMessage('');
      await mutateThread();
      await mutateCache(endpoints.messages.root);
      await mutateCache(endpoints.notifications.summary);
    } finally {
      setSending(false);
    }
  };

  const accountLabel = thread?.account
    ? `${thread.account.firstName} ${thread.account.lastName}`.trim()
    : accountId;
  const aiEnabled = thread?.account?.aiEnabled ?? true;

  useEffect(() => {
    if (!thread?.threadId) return;
    mutateCache(endpoints.messages.root);
    mutateCache(endpoints.notifications.summary);
  }, [mutateCache, thread?.threadId, thread?.messages?.length]);

  const handleToggleAi = (nextValue: boolean) => {
    setAiPendingValue(nextValue);
    setAiDialogOpen(true);
  };

  const handleConfirmAi = async () => {
    if (!accountId || aiPendingValue === null) return;
    setAiSaving(true);
    try {
      await MessagesApi.updateAiEnabled(accountId, aiPendingValue);
      await mutateThread();
    } finally {
      setAiSaving(false);
      setAiDialogOpen(false);
      setAiPendingValue(null);
    }
  };

  const handleCancelAi = () => {
    if (aiSaving) return;
    setAiDialogOpen(false);
    setAiPendingValue(null);
  };

  return (
    <Card variant={compact ? 'outlined' : undefined}>
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6">{t('messages.title')}</Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              {accountLabel ? (
                <Typography variant="body2" color="text.secondary">
                  {accountLabel}
                </Typography>
              ) : null}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {t('messages.aiReplies.label')}
                </Typography>
                <Switch
                  size="small"
                  checked={aiEnabled}
                  disabled={!accountId || aiSaving}
                  onChange={(_, checked) => handleToggleAi(checked)}
                />
              </Stack>
            </Stack>
          </Stack>

          {threadLoading && (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          )}
          {threadError && (
            <Typography variant="body2" color="error">
              Failed to load messages.
            </Typography>
          )}

          {!threadLoading && !threadError && mergedMessages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('messages.threadEmpty')}
            </Typography>
          )}

          {!threadLoading && !threadError && mergedMessages.length > 0 && (
            <Box sx={{ maxHeight: compact ? 280 : 520, overflowY: 'auto', pr: 1 }}>
              <Stack spacing={1.5} divider={<Divider flexItem />}>
                {mergedMessages.map((item) => {
                  const isWeb = item.senderType === 'web';
                  const isAi = item.senderType === 'ai';
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        alignSelf: isWeb ? 'flex-end' : 'flex-start',
                        width: isWeb ? '80%' : '100%',
                        bgcolor: isWeb ? 'primary.light' : isAi ? 'info.light' : 'grey.100',
                        color: 'text.primary',
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      {isWeb && item.senderName ? (
                        <Typography variant="caption" color="text.secondary">
                          {item.senderName}
                        </Typography>
                      ) : null}
                      {isAi ? (
                        <Typography variant="caption" color="text.secondary">
                          AI Assistant
                        </Typography>
                      ) : null}
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {item.body}
                      </Typography>
                    {item.senderType === 'mobile' && item.status === 'needs_human' && item.aiError ? (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                        AI error: {item.aiError}
                      </Typography>
                    ) : null}
                    {item.senderType === 'mobile' && item.aiOutOfScope ? (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                        {t('messages.aiReplies.outOfScope')}
                      </Typography>
                    ) : null}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  );
                })}
                <Button
                  size="small"
                  variant="text"
                  onClick={handleLoadOlder}
                  disabled={loadingOlder}
                  sx={{ alignSelf: 'center' }}
                >
                  {t('messages.loadOlder')}
                </Button>
              </Stack>
            </Box>
          )}

          <Divider flexItem />

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('messages.inputPlaceholder')}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              multiline
              minRows={compact ? 1 : 2}
            />
            <Button variant="contained" onClick={handleSend} disabled={sending || !accountId}>
              {t('messages.send')}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
      <Dialog open={aiDialogOpen} onClose={handleCancelAi}>
        <DialogTitle>
          {aiPendingValue ? t('messages.aiReplies.enableTitle') : t('messages.aiReplies.disableTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {aiPendingValue
              ? t('messages.aiReplies.enableBody')
              : t('messages.aiReplies.disableBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAi} disabled={aiSaving}>
            {t('accounts.actions.cancel')}
          </Button>
          <Button variant="contained" onClick={handleConfirmAi} disabled={aiSaving}>
            {t('accounts.actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
