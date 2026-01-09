'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocales } from 'src/locales';
import { useGetMessageThreads } from 'src/api/messages';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import MessageThreadPanel from '../components/message-thread-panel';

export default function MessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { threads, threadsLoading } = useGetMessageThreads();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const accountIdParam = searchParams.get('accountId');

  useEffect(() => {
    if (accountIdParam) {
      setSelectedAccountId(accountIdParam);
      return;
    }
    if (threads.length && !selectedAccountId) {
      setSelectedAccountId(threads[0].account.id);
    }
  }, [accountIdParam, selectedAccountId, threads]);

  const handleSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    const query = new URLSearchParams(searchParams.toString());
    query.set('accountId', accountId);
    router.push(`${paths.dashboard.messages.root}?${query.toString()}`);
  };

  const threadList = useMemo(
    () =>
      threads.map((thread) => ({
        id: thread.threadId,
        accountId: thread.account.id,
        title: `${thread.account.firstName} ${thread.account.lastName}`.trim(),
        subtitle: thread.lastMessage?.body ?? '',
        unread: thread.unreadCount,
      })),
    [threads]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack spacing={3}>
        <Typography variant="h4">{t('messages.title')}</Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ minWidth: 280, flex: { md: '0 0 320px' } }}>
            <List dense>
              {threadsLoading && (
                <ListItemText primary="Loading..." sx={{ px: 2, py: 2 }} />
              )}
              {!threadsLoading && threadList.length === 0 && (
                <ListItemText primary={t('messages.empty')} sx={{ px: 2, py: 2 }} />
              )}
              {!threadsLoading &&
                threadList.map((thread) => (
                  <ListItemButton
                    key={thread.id}
                    selected={thread.accountId === selectedAccountId}
                    onClick={() => handleSelect(thread.accountId)}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">{thread.title}</Typography>
                          {thread.unread ? (
                            <Box
                              sx={{
                                minWidth: 20,
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 999,
                                bgcolor: 'error.main',
                                color: 'common.white',
                                fontSize: 11,
                                fontWeight: 700,
                                textAlign: 'center',
                              }}
                            >
                              {thread.unread}
                            </Box>
                          ) : null}
                        </Stack>
                      }
                      secondary={
                        thread.subtitle ? (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {thread.subtitle}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItemButton>
                ))}
            </List>
          </Card>

          <Box sx={{ flex: 1 }}>
            {selectedAccountId ? (
              <MessageThreadPanel accountId={selectedAccountId} />
            ) : (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('messages.selectThread')}
                </Typography>
              </Card>
            )}
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
