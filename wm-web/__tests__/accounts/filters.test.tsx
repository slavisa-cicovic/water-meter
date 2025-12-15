import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import AccountsListView from 'src/sections/accounts/view/accounts-list-view';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const server = setupServer();
const ACCOUNTS_URL = '/api/accounts';

const makeResponse = (accounts: any[], total: number) => ({ accounts, total });

const handlers = [
  http.get(ACCOUNTS_URL, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');

    const all = [
      { id: '1', data: { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', address: 'Addr' }, type: 'consumer', verificationStatus: 'verified' },
      { id: '2', data: { firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', address: 'Addr' }, type: 'staff', verificationStatus: 'pending' },
      { id: '3', data: { firstName: 'Carol', lastName: 'Lee', email: 'carol@example.com', address: 'Addr' }, type: 'staff', verificationStatus: 'rejected' },
    ];

    let filtered = all;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          `${a.data.firstName} ${a.data.lastName}`.toLowerCase().includes(s) ||
          a.data.email.toLowerCase().includes(s)
      );
    }
    if (type) {
      filtered = filtered.filter((a) => (type === 'consumer' ? a.type === 'consumer' : a.type === 'staff'));
    }
    if (status) {
      filtered = filtered.filter((a) => a.verificationStatus === status);
    }

    return new Response(JSON.stringify(makeResponse(filtered, filtered.length)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
];

describe('Accounts filters', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const renderWithSWR = (ui: React.ReactNode) =>
    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {ui}
      </SWRConfig>
    );

  it('applies search filter and shows filtered rows', async () => {
    server.use(...handlers);

    renderWithSWR(<AccountsListView />);

    const searchInput = await screen.findByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'alice');

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
      expect(screen.queryByText(/Bob Jones/)).not.toBeInTheDocument();
    });
  });

  it('applies type filter', async () => {
    server.use(...handlers);

    renderWithSWR(<AccountsListView />);

    const typeSelect = await screen.findByLabelText(/type/i);
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByRole('option', { name: /consumer/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Bob Jones/)).not.toBeInTheDocument();
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });
  });

  it('applies status filter', async () => {
    server.use(...handlers);

    renderWithSWR(<AccountsListView />);

    const statusSelect = await screen.findByLabelText(/status/i);
    await userEvent.click(statusSelect);
    await userEvent.click(screen.getByRole('option', { name: /pending/i }));

    await waitFor(() => {
      expect(screen.getByText(/Bob Jones/)).toBeInTheDocument();
      expect(screen.queryByText(/Alice Smith/)).not.toBeInTheDocument();
    });
  });

  it('applies combined filters and uses total from API', async () => {
    server.use(
      http.get(ACCOUNTS_URL, ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search');
        const type = url.searchParams.get('type');
        const status = url.searchParams.get('status');

        const all = [
          { id: '1', data: { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', address: 'Addr' }, type: 'consumer', verificationStatus: 'verified' },
          { id: '2', data: { firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', address: 'Addr' }, type: 'staff', verificationStatus: 'pending' },
        ];

        let filtered = all;
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              `${a.data.firstName} ${a.data.lastName}`.toLowerCase().includes(s) ||
              a.data.email.toLowerCase().includes(s)
          );
        }
        if (type) {
          filtered = filtered.filter((a) => (type === 'consumer' ? a.type === 'consumer' : a.type === 'staff'));
        }
        if (status) {
          filtered = filtered.filter((a) => a.verificationStatus === status);
        }

        return new Response(JSON.stringify({ accounts: filtered, total: 30 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );

    renderWithSWR(<AccountsListView />);

    const searchInput = await screen.findByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'bob');

    const typeSelect = await screen.findByLabelText(/type/i);
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByRole('option', { name: /staff/i }));

    const statusSelect = await screen.findByLabelText(/status/i);
    await userEvent.click(statusSelect);
    await userEvent.click(screen.getByRole('option', { name: /pending/i }));

    await waitFor(() => {
      expect(screen.getByText(/Bob Jones/)).toBeInTheDocument();
      expect(screen.queryByText(/Alice Smith/)).not.toBeInTheDocument();
    });

    // Should reflect total from API (not just page length)
    expect(screen.getByText(/of 30/)).toBeInTheDocument();
  });
});
