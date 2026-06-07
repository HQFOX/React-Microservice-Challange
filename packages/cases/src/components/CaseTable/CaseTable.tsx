import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { Heading } from 'theme-ui';

import { Case, CasesApi, UserApi } from 'shared';
import { UserCell, StatusCell } from './TableCells';
import { AssigneeFilter } from '../AssigneeFilter';
import { Pagination } from './Pagination';

const DEFAULT_PAGE_SIZE = 10;

export const CaseTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageIndex = Math.max(0, Number(searchParams.get('page') ?? 1) - 1);
  const pageSize = Math.max(
    1,
    Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
  );
  const assigneeIds = searchParams.getAll('assignee_id');
  const pagination: PaginationState = { pageIndex, pageSize };

  const { data, isLoading, error } = CasesApi.useGetCasesQuery({
    page_number: pageIndex + 1,
    page_size: pageSize,
    assignee_ids: assigneeIds.length > 0 ? assigneeIds : undefined,
  });

  const { data: users } = UserApi.useGetUsersQuery();

  const { total_count, cases, first, next, self } = data || {};

  const columns = useMemo<ColumnDef<Case>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <RouterLink
            to={`/cases/${row.original.identifier}`}
            sx={{ variant: 'links.tertiary' }}
          >
            {row.original.name}
          </RouterLink>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue<string>();
          return <StatusCell status={status} />;
        },
      },
      {
        header: 'Assignee',
        accessorKey: 'assignee_id',
        cell: ({ getValue }) => {
          const assigneeId = getValue<string>();

          const user = users?.find((user) => user.identifier === assigneeId);
          return <UserCell user={user} />;
        },
      },
    ],
    [users],
  );

  const onPaginationChange = useCallback(
    (
      updater: PaginationState | ((prev: PaginationState) => PaginationState),
    ) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater;
      setSearchParams((params) => {
        params.set('page', String(next.pageIndex + 1));
        params.set('pageSize', String(next.pageSize));
        return params;
      });
    },
    [pagination, setSearchParams],
  );

  const table = useReactTable({
    data: cases || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total_count,
    state: { pagination },
    onPaginationChange,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading cases.</div>;

  return (
    <div sx={{ width: '100%' }}>
      <div
        sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}
      >
        <Heading as="h2">Cases</Heading>
        <AssigneeFilter users={users} />
      </div>
      <table sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              sx={{
                borderBottomWidth: 'border-width-md',
                borderBottomStyle: 'solid',
                borderBottomColor: 'borderLight',
              }}
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  sx={{
                    px: 'spacing-sm',
                    py: 'spacing-xs',
                    textAlign: 'left',
                    fontWeight: 'font-weight-semi-bold',
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              sx={{
                borderBottomWidth: 'border-width-sm',
                borderBottomStyle: 'solid',
                borderBottomColor: 'borderLight',
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} sx={{ px: 'spacing-sm', py: 'spacing-xs' }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        table={table}
        pageIndex={pageIndex}
        first={first}
        next={next}
        self={self}
      />
    </div>
  );
};
