import { useQuery } from '@tanstack/react-query';

import fetchTyped from '../../utils/fetchTyped';
import { Case, GetCasesResponse } from '../../mockApi/types';

export interface GetCasesParams {
  page_number?: number;
  page_size?: number;
  status?: string;
  assignee_ids?: string[];
}

export const useGetCasesQuery = (params: GetCasesParams = {}) => {
  const { page_number = 1, page_size = 10, status, assignee_ids } = params;

  const searchParams = new URLSearchParams({
    page_number: String(page_number),
    page_size: String(page_size),
    ...(status && { status }),
  });
  assignee_ids?.forEach((id) => searchParams.append('assignee_id', id));

  return useQuery({
    queryKey: ['cases', params],
    queryFn: () =>
      fetchTyped<GetCasesResponse>(`/api/cases?${searchParams}`, {}),
  });
};

export const useGetCaseQuery = (id?: string) => {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => fetchTyped<Case>(`/api/cases/${id}`, {}),
    enabled: !!id,
  });
};
