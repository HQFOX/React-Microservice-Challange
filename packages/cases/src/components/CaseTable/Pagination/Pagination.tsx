import { Table } from '@tanstack/react-table';
import { Case } from 'shared';
import { Button, Label, Select } from 'theme-ui';

interface PaginationProps {
  table: Table<Case>;
  pageIndex: number;
  first: string | undefined;
  next: string | undefined;
  self: string | undefined;
}

export const Pagination = ({
  table,
  pageIndex,
  first,
  next,
  self,
}: PaginationProps) => {
  return (
    <nav
      aria-label="Pagination"
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 'spacing-xs',
        mt: 'spacing-sm',
        width: 'fit-content',
        ml: 'auto',
      }}
    >
      {first !== self && (
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to previous page"
          variant="secondary"
        >
          Previous
        </Button>
      )}
      <Label htmlFor="page-select" sx={{ width: 'unset' }}>
        Page:{' '}
      </Label>
      <Select
        id="page-select"
        value={pageIndex + 1}
        onChange={(e) => table.setPageIndex(Number(e.target.value) - 1)}
        sx={{ minWidth: '40px' }}
      >
        {Array.from({ length: table.getPageCount() || 1 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </Select>
      {next && (
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to next page"
          variant="secondary"
        >
          Next
        </Button>
      )}
    </nav>
  );
};
