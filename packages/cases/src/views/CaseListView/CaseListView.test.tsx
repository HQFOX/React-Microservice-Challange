import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { apiHandlers } from 'shared';
import { CaseListView } from './CaseListView';

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderView = (initialSearch = '') =>
  render(
    <MemoryRouter initialEntries={[`/${initialSearch}`]}>
      <QueryClientProvider client={createQueryClient()}>
        <CaseListView />
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('CaseListView', () => {
  it('renders a Cases heading', async () => {
    renderView();

    await screen.findByRole('heading', { level: 2, name: 'Cases' });
  });

  it('shows a loading state before the API responds', () => {
    renderView();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders table column headers after data loads', async () => {
    renderView();

    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', { name: 'Name' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Status' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Assignee' }),
      ).toBeInTheDocument();
    });
  });

  it('renders case names from the API in table rows', async () => {
    renderView();

    expect(
      await screen.findByRole('link', { name: 'Reilly - Hamill' }),
    ).toBeInTheDocument();
  });

  it('renders a status label via StatusCell', async () => {
    renderView();

    // first mock case has status CASE_ON_HOLD → "On Hold"
    const cells = await screen.findAllByText('On Hold');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders an assignee name via UserCell', async () => {
    renderView();

    // first mock case assignee_id 287c3a82... → "Elijah Kirlin"
    const cells = await screen.findAllByText('Elijah Kirlin');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders the AssigneeFilter component', async () => {
    renderView();

    expect(
      await screen.findByRole('button', { name: /filter by assignee/i }),
    ).toBeInTheDocument();
  });

  it('renders the Pagination navigation landmark', async () => {
    renderView();

    expect(
      await screen.findByRole('navigation', { name: 'Pagination' }),
    ).toBeInTheDocument();
  });

  it('filters cases by assignee when a checkbox is selected', async () => {
    renderView();

    // Wait for the table to load
    await screen.findByRole('link', { name: 'Reilly - Hamill' });

    // Open the assignee filter dropdown
    fireEvent.click(
      screen.getByRole('button', { name: /filter by assignee/i }),
    );

    // Select "Elijah Kirlin" (assignee for "Reilly - Hamill")
    fireEvent.click(screen.getByRole('checkbox', { name: /elijah kirlin/i }));

    // After filtering, "Reilly - Hamill" should still be visible
    expect(
      await screen.findByRole('link', { name: 'Reilly - Hamill' }),
    ).toBeInTheDocument();
  });
});
