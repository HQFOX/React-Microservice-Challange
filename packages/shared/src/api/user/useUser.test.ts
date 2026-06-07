import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { apiHandlers } from '../../mockApi/handlers';
import { users } from '../../mockApi/users';
import { useGetUsersQuery } from './useUser';

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

describe('useGetUsersQuery', () => {
  it('returns the list of users on success', async () => {
    const { result } = renderHook(() => useGetUsersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(users);
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useGetUsersQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('enters an error state when the server returns a non-2xx response', async () => {
    server.use(
      http.get('/api/users', () => new HttpResponse(null, { status: 500 })),
    );

    const { result } = renderHook(() => useGetUsersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});
