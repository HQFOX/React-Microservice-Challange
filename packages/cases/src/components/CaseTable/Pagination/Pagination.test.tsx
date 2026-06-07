import { render, screen } from '@testing-library/react';
import { Table } from '@tanstack/react-table';
import { Case } from 'shared';
import { Pagination } from '../Pagination';

const createMockTable = (overrides: Partial<Table<Case>> = {}): Table<Case> =>
  ({
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageIndex: vi.fn(),
    getCanPreviousPage: vi.fn().mockReturnValue(true),
    getCanNextPage: vi.fn().mockReturnValue(true),
    getPageCount: vi.fn().mockReturnValue(3),
    ...overrides,
  }) as unknown as Table<Case>;

describe('Pagination', () => {
  it('renders a navigation landmark labelled "Pagination"', () => {
    render(
      <Pagination
        table={createMockTable()}
        pageIndex={0}
        first="page1"
        next="page2"
        self="page2"
      />,
    );

    expect(
      screen.getByRole('navigation', { name: 'Pagination' }),
    ).toBeInTheDocument();
  });

  it('associates the label with the page select', () => {
    render(
      <Pagination
        table={createMockTable()}
        pageIndex={0}
        first="page1"
        next="page2"
        self="page2"
      />,
    );

    expect(screen.getByLabelText('Page:')).toBeInTheDocument();
    expect(screen.getByLabelText('Page:')).toHaveAttribute('id', 'page-select');
  });

  it('renders the previous button with an accessible label', () => {
    render(
      <Pagination
        table={createMockTable()}
        pageIndex={1}
        first="page1"
        next="page2"
        self="page2"
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to previous page' }),
    ).toBeInTheDocument();
  });

  it('renders the next button with an accessible label', () => {
    render(
      <Pagination
        table={createMockTable()}
        pageIndex={0}
        first="page1"
        next="page2"
        self="page1"
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to next page' }),
    ).toBeInTheDocument();
  });

  it('hides the previous button when on the first page (first === self)', () => {
    render(
      <Pagination
        table={createMockTable()}
        pageIndex={0}
        first="page1"
        next="page2"
        self="page1"
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Go to previous page' }),
    ).not.toBeInTheDocument();
  });

  it('hides the next button when there is no next page', () => {
    render(
      <Pagination
        table={createMockTable()}
        pageIndex={2}
        first="page1"
        next={undefined}
        self="page3"
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Go to next page' }),
    ).not.toBeInTheDocument();
  });

  it('renders the correct number of page options based on getPageCount', () => {
    render(
      <Pagination
        table={createMockTable({ getPageCount: () => 5 })}
        pageIndex={0}
        first="page1"
        next="page2"
        self="page1"
      />,
    );

    expect(screen.getAllByRole('option')).toHaveLength(5);
  });
});
