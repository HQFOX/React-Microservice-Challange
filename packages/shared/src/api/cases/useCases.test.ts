import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { apiHandlers } from '../../mockApi/handlers';
import { cases } from '../../mockApi/cases';
import { useGetCasesQuery, useGetCaseQuery } from './useCases';

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useGetCasesQuery', () => {
  describe('default params', () => {
    it('fetches cases with page_number=1 and page_size=10 by default', async () => {
      const { result } = renderHook(() => useGetCasesQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.cases).toHaveLength(10);
      expect(result.current.data?.total_count).toBe(cases.length);
    });
  });

  describe('custom pagination params', () => {
    it('fetches the correct page slice when page_number and page_size are provided', async () => {
      const { result } = renderHook(
        () => useGetCasesQuery({ page_number: 2, page_size: 5 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.cases).toHaveLength(5);
      expect(result.current.data?.cases[0]).toEqual(cases[5]);
    });
  });

  describe('status filter', () => {
    it('sends the status param in the request URL', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get('/api/cases', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            cases: [],
            total_count: 0,
            first: '',
            next: '',
            prev: '',
            self: '',
          });
        }),
      );

      const { result } = renderHook(
        () => useGetCasesQuery({ status: 'CASE_ON_HOLD' }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(new URL(capturedUrl!).searchParams.get('status')).toBe(
        'CASE_ON_HOLD',
      );
    });
  });

  describe('assignee_ids filter', () => {
    it('appends each assignee_id as a separate query param', async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get('/api/cases', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            cases: [],
            total_count: 0,
            first: '',
            next: '',
            prev: '',
            self: '',
          });
        }),
      );

      const assigneeIds = [
        '287c3a82-ea31-4db1-b0a5-ce7f0bf975fe',
        '6236068a-99fc-463a-be40-0ee79e1b94a0',
      ];
      const { result } = renderHook(
        () => useGetCasesQuery({ assignee_ids: assigneeIds }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URL(capturedUrl!).searchParams;
      expect(params.getAll('assignee_id')).toEqual(assigneeIds);
    });

    it('filters cases by assignee_id via the real handler', async () => {
      const targetAssigneeId = '287c3a82-ea31-4db1-b0a5-ce7f0bf975fe';
      const expected = cases.filter((c) => c.assignee_id === targetAssigneeId);
      const { result } = renderHook(
        () =>
          useGetCasesQuery({
            assignee_ids: [targetAssigneeId],
            page_size: expected.length,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.cases).toHaveLength(expected.length);
      result.current.data?.cases.forEach((c) => {
        expect(c.assignee_id).toBe(targetAssigneeId);
      });
    });
  });

  describe('error handling', () => {
    it('enters an error state when the server returns a non-2xx response', async () => {
      server.use(
        http.get('/api/cases', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const { result } = renderHook(() => useGetCasesQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});

describe('useGetCaseQuery', () => {
  describe('when the case exists', () => {
    it('returns the matching case', async () => {
      const target = cases[0];
      const { result } = renderHook(() => useGetCaseQuery(target.identifier), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(target);
    });
  });

  describe('when the case does not exist', () => {
    it('enters an error state on a 404 response', async () => {
      const { result } = renderHook(() => useGetCaseQuery('non-existent-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
