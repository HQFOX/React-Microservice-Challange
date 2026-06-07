import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { apiHandlers } from 'shared';
import { CaseTable } from './CaseTable';

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderTable = (initialSearch = '') =>
  render(
    <MemoryRouter initialEntries={[`/${initialSearch}`]}>
      <QueryClientProvider client={createQueryClient()}>
        <CaseTable />
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('CaseTable', () => {
  it('shows a loading state before the API responds', () => {
    renderTable();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows an error state when the API fails', async () => {
    server.use(http.get('/api/cases', () => HttpResponse.error()));

    renderTable();

    expect(await screen.findByText('Error loading cases.')).toBeInTheDocument();
  });

  it('renders the "Cases" heading', async () => {
    renderTable();

    await screen.findByRole('heading', { level: 2, name: 'Cases' });
  });

  it('renders column headers: Name, Status, Assignee', async () => {
    renderTable();

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

  it('renders case names as links to the detail route', async () => {
    renderTable();

    const link = await screen.findByRole('link', { name: 'Reilly - Hamill' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/cases/'));
  });

  it('renders a status label via StatusCell', async () => {
    renderTable();

    const cells = await screen.findAllByText('On Hold');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders an assignee name via UserCell', async () => {
    renderTable();

    const cells = await screen.findAllByText('Elijah Kirlin');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders the AssigneeFilter component', async () => {
    renderTable();

    expect(
      await screen.findByRole('button', { name: /filter by assignee/i }),
    ).toBeInTheDocument();
  });

  it('renders the Pagination navigation landmark', async () => {
    renderTable();

    expect(
      await screen.findByRole('navigation', { name: 'Pagination' }),
    ).toBeInTheDocument();
  });

  it('reads the page param from the URL and sets the page select accordingly', async () => {
    renderTable('?page=2');

    const select = await screen.findByLabelText('Page:');
    expect(select).toHaveValue('2');
  });

  it('clamps a negative page param to page 1', async () => {
    renderTable('?page=-5');

    const select = await screen.findByLabelText('Page:');
    expect(select).toHaveValue('1');
  });

  it('clamps a negative pageSize param and still renders the table', async () => {
    renderTable('?pageSize=-5');

    await screen.findByRole('heading', { level: 2, name: 'Cases' });
    expect(screen.queryByText('Error loading cases.')).not.toBeInTheDocument();
  });
});
