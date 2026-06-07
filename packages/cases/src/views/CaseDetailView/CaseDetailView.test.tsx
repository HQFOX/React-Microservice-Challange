import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiHandlers } from 'shared';
import { CaseDetailView } from './CaseDetailView';

const KNOWN_CASE = {
  identifier: 'eb038a4c-1b7a-4a88-80ee-8a086b0fdd3d',
  name: 'Reilly - Hamill',
  status: 'CASE_ON_HOLD',
  assignee_id: '287c3a82-ea31-4db1-b0a5-ce7f0bf975fe',
};

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderView = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/cases/${id}`]}>
      <QueryClientProvider client={createQueryClient()}>
        <Routes>
          <Route path="/cases/:id" element={<CaseDetailView />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('CaseDetailView', () => {
  describe('when the case loads successfully', () => {
    it('renders the case name as a heading', async () => {
      renderView(KNOWN_CASE.identifier);

      await screen.findByRole('heading', { name: KNOWN_CASE.name });
    });

    it('renders the human-readable status label', async () => {
      renderView(KNOWN_CASE.identifier);

      await screen.findByText('On Hold');
    });

    it('renders the assignee user cell', async () => {
      renderView(KNOWN_CASE.identifier);

      await screen.findByText('Active');
    });
  });

  describe('when the case is not found', () => {
    it('renders an error message', async () => {
      renderView('non-existent-id');

      await screen.findByText('Error loading case.');
    });
  });
});
